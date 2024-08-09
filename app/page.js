import Dendrogram from "@/components/Dendrogram/Dendrogram";
import data from "@/data/dendData.json";

export default function Home() {
  return <Dendrogram data={data} width={900} height={600} />;
}
