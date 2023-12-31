import { useWallet } from "@mintbase-js/react";
import { buy, execute, TransactionSuccessEnum } from "@mintbase-js/sdk";
import {
  EState,
  MbAmountInput,
  MbButton,
  MbInfoCard,
  MbText,
} from "mintbase-ui";

/*
Buy Modal Info:
The component that handles the NFT Buy Information
*/

import { useState } from "react";
import { useNearPrice } from "../../hooks/useNearPrice";
import { nearToYocto } from "../../lib/numbers";
import { SignInButton } from "../SignInButton";

function AvailableNftComponent({ data }) {
  const {
    amountAvailable,
    marketId,
    nftContractId,
    price,
    tokenId,
    tokensTotal,
    isTokenListLoading,
  } = data;

  const { selector, isConnected } = useWallet();

  const message = `${amountAvailable} of ${tokensTotal} Available`;
  // state to check the price x amount according to user interaction

  const [currentPrice, setCurrentPrice] = useState(price);
  const [amount, setAmount] = useState(1);

  const nearPrice = useNearPrice();

  const callback = {
    type: TransactionSuccessEnum.MAKE_OFFER,
    args: {
      tokenId,
      price: nearToYocto(currentPrice.toString()),
    },
  };

  const singleBuy = async () => {
    const wallet = await selector.wallet();

    await execute(
      { wallet, callbackArgs: callback },
      {
        ...buy({
          contractAddress: nftContractId,
          tokenId,
          affiliateAccount: process.env.NEXT_PUBLIC_AFFILIATE_ACCOUNT,
          marketId,
          price: nearToYocto(currentPrice.toString()),
        }),
      }
    );
  };

  // handler function to call the wallet methods to proceed the buy.
  const handleBuy = async () => {
    const isSingleAmount = amount === 1;

    if (isSingleAmount) {
      await singleBuy();
    }
  };

  const setNewPrice = (val) => {
    const value = Number(val);

    setAmount(value);
    setCurrentPrice(price * value);
  };

  return isConnected && !isTokenListLoading ? (
    <div className="mt-2">
      <div className="bg-gray-50 py-4 text-center">
        <MbText className="p-med-90 text-gray-700">
          <span className="p-med-130 text-black">{message}</span>
        </MbText>
      </div>
      <div className="py-2">
        <div className="mb-8">
          <MbInfoCard
            boxInfo={{
              description: (
                <div className="text-black">${currentPrice.toFixed(2)} N</div>
              ),
              title: <div className="text-black">Price </div>,
              lowerLeftText: (
                <div className="text-black">
                  ~ ${(Number(nearPrice) * Number(currentPrice)).toFixed(2)} USD{" "}
                </div>
              ),
            }}
          />
          <div className="mt-4">
            <MbText className="text-gray-700 mb-2">Quantity</MbText>
            <MbAmountInput
              className="text-black"
              maxAmount={Math.min(amountAvailable, 1)}
              onValueChange={(e) => {
                setNewPrice(e);
              }}
              disabled={amountAvailable === 1}
            />
          </div>
        </div>
        <div className="text-center">
          <MbButton
            label="Buy with NEAR"
            state={EState.ACTIVE}
            onClick={handleBuy}
          />
        </div>
      </div>
    </div>
  ) : (
    <SignInButton />
  );
}

export function BuyModalInfo({ data }) {
  if (!(data?.amountAvailable > 0)) {
    return (
      <div className="mt-2">
        <div className="bg-gray-50 py-4 text-center">
          <MbText className="p-med-90 text-gray-700">
            <span className="p-med-130 text-black">NFT Not Available</span>
          </MbText>
        </div>
      </div>
    );
  }

  return <AvailableNftComponent data={data} />;
}
