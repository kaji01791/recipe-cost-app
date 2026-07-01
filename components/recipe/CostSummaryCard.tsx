"use client";

type CostSummaryCardProps = {
  materialCost: number;
  bagCost: string;
  silicaGelCost: string;
  oxygenAbsorberCost: string;
  sealCost: string;
  boxCost: string;
  yieldCount: number;
  sellingPrice: string;
};

export default function CostSummaryCard({
  materialCost,
  bagCost,
  silicaGelCost,
  oxygenAbsorberCost,
  sealCost,
  boxCost,
  yieldCount,
  sellingPrice,
}: CostSummaryCardProps) {
  const packageCost =
    Number(bagCost || 0) +
    Number(silicaGelCost || 0) +
    Number(oxygenAbsorberCost || 0) +
    Number(sealCost || 0) +
    Number(boxCost || 0);

  const sellingPriceNumber = Number(sellingPrice || 0);

  const totalCost = materialCost + packageCost;
  const costPerPiece = yieldCount > 0 ? totalCost / yieldCount : 0;
  const profitPerPiece = sellingPriceNumber - costPerPiece;

  const costRate =
    sellingPriceNumber > 0 ? (costPerPiece / sellingPriceNumber) * 100 : 0;

  const profitRate =
    sellingPriceNumber > 0 ? (profitPerPiece / sellingPriceNumber) * 100 : 0;

  return (
    <div className="mb-8 rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">原価・利益計算</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <p>
          材料原価：
          <strong>{materialCost.toFixed(1)}円</strong>
        </p>

        <p>
          包材原価：
          <strong>{packageCost.toFixed(1)}円</strong>
        </p>

        <p>
          総原価：
          <strong>{totalCost.toFixed(1)}円</strong>
        </p>

        <p>
          製造個数：
          <strong>{yieldCount}個</strong>
        </p>

        <p>
          1個あたり原価：
          <strong>{costPerPiece.toFixed(1)}円</strong>
        </p>

        <p>
          販売価格：
          <strong>{sellingPriceNumber.toFixed(1)}円</strong>
        </p>

        <p>
          1個あたり粗利益：
          <strong>{profitPerPiece.toFixed(1)}円</strong>
        </p>

        <p>
          1個あたり原価率：
          <strong>{costRate.toFixed(1)}%</strong>
        </p>

        <p>
          1個あたり利益率：
          <strong>{profitRate.toFixed(1)}%</strong>
        </p>
      </div>
    </div>
  );
}