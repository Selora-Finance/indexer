import { deriveCLPosId } from '../../utils/misc';
import { BD_ZERO, ZERO_ADDRESS } from '../../utils/constants';
import { divideByBase } from '../../utils/math';
import {
    Transfer as TransferEvent,
    IncreaseLiquidity as IncreaseLiquidityEvent,
    DecreaseLiquidity as DecreaseLiquidityEvent,
} from '../../../generated/NonfungiblePositionManager/NonfungiblePositionManager';
import { CLPosition, LiquidityPosition, User } from '../../../generated/schema';

export function handleTransfer(event: TransferEvent) {
    const sender = event.params.from;
    const recipient = event.params.to;
    const isBurn = recipient.toHex() === ZERO_ADDRESS;
    const isTransfer = sender.toHex() !== ZERO_ADDRESS && recipient.toHex() !== ZERO_ADDRESS;
    const isMint = sender.toHex() === ZERO_ADDRESS;
    const tokenId = event.params.tokenId;
    let user = User.load(recipient.toHex());

    if (user === null) {
        user = new User(recipient.toHex());
        user.address = recipient;
        user.save();
    }

    if (isMint) {
        const clPositionId = deriveCLPosId(event.transaction.hash.toHex());
        const clPosition = CLPosition.load(clPositionId) as CLPosition;
        // LP position has been created already, so update
        const lpId = event.address.toHex() + '-' + clPosition.pool;
        const lp = LiquidityPosition.load(lpId) as LiquidityPosition;
        lp.account = user.id;
        lp.clPositionTokenId = tokenId;
        lp.save();

        // Create new CLPosition entity
        const newCLPositionId = deriveCLPosId(tokenId);
        const newCLPosition = new CLPosition(newCLPositionId);
        newCLPosition.pool = clPosition.pool;
        newCLPosition.save();
    }

    if (isTransfer) {
        const clPositionId = deriveCLPosId(tokenId);
        const clPosition = CLPosition.load(clPositionId) as CLPosition;
        const lpId = event.address.toHex() + '-' + clPosition.pool;
        const lp = LiquidityPosition.load(lpId) as LiquidityPosition;
        lp.account = user.id;
        lp.save();
    }

    if (isBurn) {
        const clPositionId = deriveCLPosId(tokenId);
        const clPosition = CLPosition.load(clPositionId) as CLPosition;
        const lpId = event.address.toHex() + '-' + clPosition.pool;
        const lp = LiquidityPosition.load(lpId) as LiquidityPosition;
        lp.account = null;
        lp.position = BD_ZERO;
        lp.save();
    }
}

export function handleIncreaseLiquidity(event: IncreaseLiquidityEvent) {
    const tokenId = event.params.tokenId;
    const clPositionId = deriveCLPosId(tokenId);
    const clPosition = CLPosition.load(clPositionId) as CLPosition;
    const lpId = event.address.toHex() + '-' + clPosition.pool;
    const lp = LiquidityPosition.load(lpId) as LiquidityPosition;
    const amount = divideByBase(event.params.liquidity);

    lp.position = lp.position.plus(amount);
    lp.save();
}

export function handleDecreaseLiquidity(event: DecreaseLiquidityEvent) {
    const tokenId = event.params.tokenId;
    const clPositionId = deriveCLPosId(tokenId);
    const clPosition = CLPosition.load(clPositionId) as CLPosition;
    const lpId = event.address.toHex() + '-' + clPosition.pool;
    const lp = LiquidityPosition.load(lpId) as LiquidityPosition;
    const amount = divideByBase(event.params.liquidity);

    lp.position = lp.position.minus(amount);
    lp.save();
}
