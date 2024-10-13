import ky from "ky";

export type CoinData = {
  id: string;
  symbol: string;
  image: string;
  price: number;
  hour1: number;
  hour24: number;
  day7: number;
  day30: number;
  marketcap: number;
  isfavorite?: boolean;
};

export type TokenBalance = {
  symbol: string;
  balance: number;
  price: number;
  valueInUSD: string;
};

export async function getCoinData(): Promise<CoinData[] | null> {
  try {
    const result: any[] = await ky
      .get("https://api.coingecko.com/api/v3/coins/markets", {
        searchParams: {
          vs_currency: "usd",
          price_change_percentage: "1h,24h,7d,30d",
        },
      })
      .json();

    const data = result?.map((data: any) => ({
      id: data.id,
      symbol: data.symbol,
      image: data.image,
      price: data.current_price,
      hour1: data.price_change_percentage_1h_in_currency || 0,
      hour24: data.price_change_percentage_24h_in_currency || 0,
      day7: data.price_change_percentage_7d_in_currency || 0,
      day30: data.price_change_percentage_30d_in_currency || 0,
      marketcap: data.market_cap,
      isfavorite: false,
    }));

    return data;
  } catch (err) {
    console.error("Error fetching coin data:", err);
    return null;
  }
}

export const getUserBalance = async (
  user: string
): Promise<TokenBalance[] | null> => {
  try {
    const result = await ky
      .get(
        `https://www.oklink.com/api/v5/explorer/address/token-balance-starknet`,
        {
          searchParams: {
            address: user,
            chainShortName: "starknet",
            protocolType: "token_20",
            limit: "50",
          },
          headers: {
            "OK-ACCESS-KEY": /*api gir buyara*/",
            "Content-Type": "application/json",
          },
        }
      )
      .json();

    console.log("Raw OKLink API response:", JSON.stringify(result, null, 2));

    if (!result?.data?.tokenList) {
      throw new Error("Unexpected API response format");
    }

    return result.data.tokenList;
  } catch (error: any) {
    console.error(
      "Error fetching user balance from OKLink API:",
      error.message
    );
    return null;
  }
};

export const calculateTokenBalancesInUSD = async (
  user: string
): Promise<TokenBalance[] | null> => {
  try {
    const tokens = await getUserBalance(user);
    if (!tokens) throw new Error("Failed to fetch user tokens");

    const prices = await getCoinData();
    if (!prices || prices.length === 0)
      throw new Error("Failed to fetch coin prices or no prices available");

    const balancesInUSD = tokens.map((token: any) => {
      const priceInfo = prices.find(
        (price: CoinData) =>
          price.symbol.toLowerCase() === token.symbol.toLowerCase()
      );

      const balance = Number(token.holdingAmount);
      const price = priceInfo ? priceInfo.price : 0;
      const valueInUSD = balance * price;

      return {
        symbol: token.symbol,
        balance: balance,
        price: price,
        valueInUSD: price > 0 ? valueInUSD.toFixed(2) : "N/A",
      };
    });

    console.table(balancesInUSD);
    return balancesInUSD;
  } catch (err) {
    console.error("Error calculating token balances in USD:", err);
    return null;
  }
};

// Call the function to test
(async () => {
  const balances = await calculateTokenBalancesInUSD(
    "0x044a33f085b5ef75bde5df11d188e4c16db6c090f8c9c38c6020fbe6e24fcbc0"
  );
  console.log(balances);
})();
