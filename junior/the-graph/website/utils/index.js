import { FETCH_CREATED_GAME } from "../queries";

export async function subgraphQuery(query) {
  const SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/devtimnbr/learnweb3graph";
  const response = await fetch(SUBGRAPH_URL, {
    method: "POST",
    body: JSON.stringify({
      query,
    }),
  });

  if (!response.ok) {
    console.error(response);
    throw new Error("Error making subgraph query: ", response);
  }

  const json = await response.json();
  return json.data;
}
