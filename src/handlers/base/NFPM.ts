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
    const tokenId = event.params.tokenId;
    let clPosition = CLPosition.load(tokenId.toString());
    let user = User.load(recipient.toHex());

    if (user === null) {
        user = new User(recipient.toHex());
        user.address = recipient;
        user.save();
    }

    if (clPosition === null) {
        clPosition = new CLPosition(tokenId.toString());
        clPosition.transactionHash = event.transaction.hash;
    }

    if (!isBurn) clPosition.owner = user.id;
    else clPosition.owner = null;

    clPosition.save();

    if (isTransfer || isBurn) {
        // LP position has been created already, so update
        const lpId = deriveCLPosId(tokenId);
        const lp = LiquidityPosition.load(lpId) as LiquidityPosition;
        if (isTransfer) lp.account = user.id;
        else {
            lp.position = BD_ZERO;
            lp.account = null;
        }

        lp.save();
    }
}

export function handleIncreaseLiquidity(event: IncreaseLiquidityEvent) {
    const tokenId = event.params.tokenId;
    const lpId = deriveCLPosId(tokenId);
    const lp = LiquidityPosition.load(lpId) as LiquidityPosition;
    const amount = divideByBase(event.params.liquidity);

    lp.position = lp.position.plus(amount);
    lp.save();
}

export function handleDecreaseLiquidity(event: DecreaseLiquidityEvent) {
    const tokenId = event.params.tokenId;
    const lpId = deriveCLPosId(tokenId);
    const lp = LiquidityPosition.load(lpId) as LiquidityPosition;
    const amount = divideByBase(event.params.liquidity);

    lp.position = lp.position.minus(amount);
    lp.save();
}
