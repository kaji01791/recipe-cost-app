"use client";

import type { RecipeItem } from "@/app/types/recipe";

type Props = {
  items: RecipeItem[];
  yieldCount: number;
};

export default function NutritionCard({ items, yieldCount }: Props) {
  const total = items.reduce(
    (sum, item) => {
      const rate = item.amount_g / 100;
      return {
        energy: sum.energy + item.ingredients.energy * rate,
        protein: sum.protein + item.ingredients.protein * rate,
        fat: sum.fat + item.ingredients.fat * rate,
        carbs: sum.carbs + item.ingredients.carbs * rate,
        salt: sum.salt + item.ingredients.salt * rate,
      };
    },
    { energy: 0, protein: 0, fat: 0, carbs: 0, salt: 0 }
  );

  const perPiece =
    yieldCount > 0
      ? {
          energy: total.energy / yieldCount,
          protein: total.protein / yieldCount,
          fat: total.fat / yieldCount,
          carbs: total.carbs / yieldCount,
          salt: total.salt / yieldCount,
        }
      : total;

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">栄養成分計算</h2>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3 text-left">基準</th>
            <th className="p-3 text-right">熱量</th>
            <th className="p-3 text-right">たんぱく質</th>
            <th className="p-3 text-right">脂質</th>
            <th className="p-3 text-right">炭水化物</th>
            <th className="p-3 text-right">食塩相当量</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-3">レシピ全体</td>
            <td className="p-3 text-right">{total.energy.toFixed(1)} kcal</td>
            <td className="p-3 text-right">{total.protein.toFixed(1)} g</td>
            <td className="p-3 text-right">{total.fat.toFixed(1)} g</td>
            <td className="p-3 text-right">{total.carbs.toFixed(1)} g</td>
            <td className="p-3 text-right">{total.salt.toFixed(2)} g</td>
          </tr>
          <tr>
            <td className="p-3">1個あたり</td>
            <td className="p-3 text-right">{perPiece.energy.toFixed(1)} kcal</td>
            <td className="p-3 text-right">{perPiece.protein.toFixed(1)} g</td>
            <td className="p-3 text-right">{perPiece.fat.toFixed(1)} g</td>
            <td className="p-3 text-right">{perPiece.carbs.toFixed(1)} g</td>
            <td className="p-3 text-right">{perPiece.salt.toFixed(2)} g</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}