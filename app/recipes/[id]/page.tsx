"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Recipe = {
  id: number;
  name: string;
  yield_count: number;
  selling_price: number;
  bag_cost: number;
  silica_gel_cost: number;
  oxygen_absorber_cost: number;
  seal_cost: number;
  box_cost: number;
};

type Ingredient = {
  id: number;
  name: string;
  label_name: string | null;
  additives: string[] | null;
  allergens: string[] | null;
  price: number;
  amount_g: number;
  energy: number;
  protein: number;
  fat: number;
  carbs: number;
  salt: number;
};

type RecipeItem = {
  id: number;
  amount_g: number;
  ingredients: Ingredient;
};

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = Number(params.id);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [items, setItems] = useState<RecipeItem[]>([]);

  const [ingredientId, setIngredientId] = useState("");
  const [amountG, setAmountG] = useState("");

  const [sellingPrice, setSellingPrice] = useState("");
  const [bagCost, setBagCost] = useState("");
  const [silicaGelCost, setSilicaGelCost] = useState("");
  const [oxygenAbsorberCost, setOxygenAbsorberCost] = useState("");
  const [sealCost, setSealCost] = useState("");
  const [boxCost, setBoxCost] = useState("");

  const [nutritionMode, setNutritionMode] = useState<"piece" | "gram">(
    "piece"
  );
  const [nutritionAmount, setNutritionAmount] = useState("1");

  const fetchData = async () => {
    const { data: recipeData, error: recipeError } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", recipeId)
      .single();

    if (recipeError) {
      alert("レシピ取得エラー: " + recipeError.message);
      return;
    }

    setRecipe(recipeData);
    setSellingPrice(String(recipeData.selling_price || ""));
    setBagCost(String(recipeData.bag_cost || ""));
    setSilicaGelCost(String(recipeData.silica_gel_cost || ""));
    setOxygenAbsorberCost(String(recipeData.oxygen_absorber_cost || ""));
    setSealCost(String(recipeData.seal_cost || ""));
    setBoxCost(String(recipeData.box_cost || ""));

    const { data: ingredientData, error: ingredientError } = await supabase
      .from("ingredients")
      .select("*")
      .order("name", { ascending: true });

    if (ingredientError) {
      alert("原材料取得エラー: " + ingredientError.message);
      return;
    }

    setIngredients(ingredientData || []);

    const { data: itemData, error: itemError } = await supabase
      .from("recipe_items")
      .select(`
        id,
        amount_g,
        ingredients (
          id,
          name,
          label_name,
          additives,
          allergens,
          price,
          amount_g,
          energy,
          protein,
          fat,
          carbs,
          salt
        )
      `)
      .eq("recipe_id", recipeId)
      .order("id", { ascending: false });

    if (itemError) {
      alert("配合取得エラー: " + itemError.message);
      return;
    }

    setItems((itemData || []) as unknown as RecipeItem[]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = async () => {
    if (!ingredientId || !amountG) {
      alert("原材料と使用量を入力してください");
      return;
    }

    const { error } = await supabase.from("recipe_items").insert([
      {
        recipe_id: recipeId,
        ingredient_id: Number(ingredientId),
        amount_g: Number(amountG),
      },
    ]);

    if (error) {
      alert("追加エラー: " + error.message);
      return;
    }

    setIngredientId("");
    setAmountG("");
    fetchData();
  };

  const deleteItem = async (id: number) => {
    if (!confirm("この配合を削除しますか？")) return;

    const { error } = await supabase
      .from("recipe_items")
      .delete()
      .eq("id", id);

    if (error) {
      alert("削除エラー: " + error.message);
      return;
    }

    fetchData();
  };

  const saveCosts = async () => {
    const { error } = await supabase
      .from("recipes")
      .update({
        selling_price: Number(sellingPrice || 0),
        bag_cost: Number(bagCost || 0),
        silica_gel_cost: Number(silicaGelCost || 0),
        oxygen_absorber_cost: Number(oxygenAbsorberCost || 0),
        seal_cost: Number(sealCost || 0),
        box_cost: Number(boxCost || 0),
      })
      .eq("id", recipeId);

    if (error) {
      alert("保存エラー: " + error.message);
      return;
    }

    fetchData();
    alert("保存しました");
  };

  const materialCost = items.reduce((sum, item) => {
    const unitPrice = item.ingredients.price / item.ingredients.amount_g;
    return sum + unitPrice * item.amount_g;
  }, 0);

  const packageCost =
    Number(bagCost || 0) +
    Number(silicaGelCost || 0) +
    Number(oxygenAbsorberCost || 0) +
    Number(sealCost || 0) +
    Number(boxCost || 0);

  const sellingPriceNumber = Number(sellingPrice || 0);
  const totalCost = materialCost + packageCost;
  const yieldCount = recipe?.yield_count || 0;

  const costPerPiece = yieldCount > 0 ? totalCost / yieldCount : 0;
  const profitPerPiece = sellingPriceNumber - costPerPiece;

  const costRate =
    sellingPriceNumber > 0 ? (costPerPiece / sellingPriceNumber) * 100 : 0;

  const profitRate =
    sellingPriceNumber > 0 ? (profitPerPiece / sellingPriceNumber) * 100 : 0;

  const totalWeight = items.reduce((sum, item) => {
    return sum + item.amount_g;
  }, 0);

  const totalNutrition = items.reduce(
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
    {
      energy: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      salt: 0,
    }
  );

  const nutritionPerPiece =
    yieldCount > 0
      ? {
          energy: totalNutrition.energy / yieldCount,
          protein: totalNutrition.protein / yieldCount,
          fat: totalNutrition.fat / yieldCount,
          carbs: totalNutrition.carbs / yieldCount,
          salt: totalNutrition.salt / yieldCount,
        }
      : totalNutrition;

  const customAmount = Number(nutritionAmount || 0);

  const customNutrition =
    nutritionMode === "piece"
      ? {
          energy: nutritionPerPiece.energy * customAmount,
          protein: nutritionPerPiece.protein * customAmount,
          fat: nutritionPerPiece.fat * customAmount,
          carbs: nutritionPerPiece.carbs * customAmount,
          salt: nutritionPerPiece.salt * customAmount,
        }
      : totalWeight > 0
      ? {
          energy: (totalNutrition.energy / totalWeight) * customAmount,
          protein: (totalNutrition.protein / totalWeight) * customAmount,
          fat: (totalNutrition.fat / totalWeight) * customAmount,
          carbs: (totalNutrition.carbs / totalWeight) * customAmount,
          salt: (totalNutrition.salt / totalWeight) * customAmount,
        }
      : {
          energy: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          salt: 0,
        };

  const uniqueTextList = (values: string[]) => {
    return Array.from(
      new Set(values.map((value) => value.trim()).filter((value) => value !== ""))
    );
  };

  const normalizeAllergenName = (value: string) => {
    const trimmed = value.trim();

    if (trimmed === "乳") {
      return "乳成分";
    }

    return trimmed;
  };

  const ingredientLabelMap = new Map<string, number>();

  items.forEach((item) => {
    const labelName = item.ingredients.label_name || item.ingredients.name;
    const currentAmount = ingredientLabelMap.get(labelName) || 0;
    ingredientLabelMap.set(labelName, currentAmount + item.amount_g);
  });

  const ingredientLabelNames = Array.from(ingredientLabelMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([labelName]) => labelName);

  const additiveNames = uniqueTextList(
    items.flatMap((item) => item.ingredients.additives || [])
  );

  const allergenNames = uniqueTextList(
    items
      .flatMap((item) => item.ingredients.allergens || [])
      .map((allergen) => normalizeAllergenName(allergen))
  );

const ingredientLine =
  ingredientLabelNames.length > 0
    ? `原材料名：${ingredientLabelNames.join("、")}${
        additiveNames.length > 0 ? ` / ${additiveNames.join("、")}` : ""
      }`
    : "";

const allergenLine =
  allergenNames.length > 0
    ? `（一部に${allergenNames.join("・")}を含む）`
    : "";

const ingredientLabelText = [ingredientLine, allergenLine]
  .filter((line) => line !== "")
  .join("\n");

  const copyIngredientLabel = async () => {
    try {
      await navigator.clipboard.writeText(ingredientLabelText);
      alert("原材料表示をコピーしました");
    } catch {
      alert("コピーに失敗しました");
    }
  };

  const copyNutritionLabel = async () => {
    const unitText =
      nutritionMode === "piece"
        ? `${nutritionAmount || 0}個あたり`
        : `${nutritionAmount || 0}gあたり`;

    const text = `栄養成分表示（${unitText}）
熱量 ${customNutrition.energy.toFixed(0)}kcal
たんぱく質 ${customNutrition.protein.toFixed(1)}g
脂質 ${customNutrition.fat.toFixed(1)}g
炭水化物 ${customNutrition.carbs.toFixed(1)}g
食塩相当量 ${customNutrition.salt.toFixed(2)}g`;

    try {
      await navigator.clipboard.writeText(text);
      alert("栄養成分表示をコピーしました");
    } catch {
      alert("コピーに失敗しました");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          {recipe?.name || "レシピ詳細"}
        </h1>

        <p className="mb-6 text-gray-600">製造個数：{yieldCount}個</p>

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">販売価格・包材原価</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-1">
              <span className="font-bold">販売価格</span>
              <input
                className="rounded border p-3"
                placeholder="例：450"
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-bold">袋原価</span>
              <input
                className="rounded border p-3"
                placeholder="例：12"
                type="number"
                value={bagCost}
                onChange={(e) => setBagCost(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-bold">シリカゲル原価</span>
              <input
                className="rounded border p-3"
                placeholder="例：3"
                type="number"
                value={silicaGelCost}
                onChange={(e) => setSilicaGelCost(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-bold">脱酸素剤原価</span>
              <input
                className="rounded border p-3"
                placeholder="例：5"
                type="number"
                value={oxygenAbsorberCost}
                onChange={(e) => setOxygenAbsorberCost(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-bold">シール原価</span>
              <input
                className="rounded border p-3"
                placeholder="例：4"
                type="number"
                value={sealCost}
                onChange={(e) => setSealCost(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-bold">箱原価</span>
              <input
                className="rounded border p-3"
                placeholder="例：60"
                type="number"
                value={boxCost}
                onChange={(e) => setBoxCost(e.target.value)}
              />
            </label>
          </div>

          <button
            onClick={saveCosts}
            className="mt-4 rounded bg-blue-600 px-6 py-3 font-bold text-white"
          >
            保存する
          </button>
        </div>

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">原材料を追加</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <select
              className="rounded border p-3"
              value={ingredientId}
              onChange={(e) => setIngredientId(e.target.value)}
            >
              <option value="">原材料を選択</option>
              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
            </select>

            <input
              className="rounded border p-3"
              placeholder="使用量 g"
              type="number"
              value={amountG}
              onChange={(e) => setAmountG(e.target.value)}
            />

            <button
              onClick={addItem}
              className="rounded bg-black px-6 py-3 font-bold text-white"
            >
              追加する
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">配合一覧</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">原材料</th>
                  <th className="p-3 text-left">表示名</th>
                  <th className="p-3 text-right">使用量</th>
                  <th className="p-3 text-right">材料原価</th>
                  <th className="p-3 text-center">操作</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const cost =
                    (item.ingredients.price / item.ingredients.amount_g) *
                    item.amount_g;

                  return (
                    <tr key={item.id} className="border-b">
                      <td className="p-3">{item.ingredients.name}</td>
                      <td className="p-3">
                        {item.ingredients.label_name || item.ingredients.name}
                      </td>
                      <td className="p-3 text-right">{item.amount_g}g</td>
                      <td className="p-3 text-right">{cost.toFixed(1)}円</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="rounded bg-red-600 px-3 py-1 text-white"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {items.length === 0 && (
            <p className="mt-4 text-gray-500">
              まだ配合が登録されていません。
            </p>
          )}
        </div>

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">原材料表示</h2>

          <div className="grid gap-4">
            <div>
              <p className="font-bold">原材料名</p>
              <p className="mt-1 rounded border bg-gray-50 p-3">
                {ingredientLabelNames.length > 0
                  ? ingredientLabelNames.join("、")
                  : "未登録"}
              </p>
            </div>

            <div>
              <p className="font-bold">添加物</p>
              <p className="mt-1 rounded border bg-gray-50 p-3">
                {additiveNames.length > 0 ? additiveNames.join("、") : "-"}
              </p>
            </div>

            <div>
              <p className="font-bold">アレルゲン表示</p>
              <p className="mt-1 rounded border bg-gray-50 p-3">
                {allergenNames.length > 0
                  ? `一部に${allergenNames.join("・")}を含む`
                  : "-"}
              </p>
            </div>

            <div>
              <p className="font-bold">コピー内容</p>
              <pre className="mt-1 whitespace-pre-wrap rounded border bg-gray-50 p-3 text-sm">
                {ingredientLabelText || "未登録"}
              </pre>
            </div>
          </div>

          <button
            onClick={copyIngredientLabel}
            className="mt-4 rounded bg-green-600 px-6 py-3 font-bold text-white"
          >
            原材料表示をコピー
          </button>

          <p className="mt-4 text-sm text-gray-500">
            ※ 原材料名は、登録されている配合の使用量が多い順に並べています。
            最終的な表示内容は、実際の商品仕様に合わせて確認してください。
          </p>
        </div>

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

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">栄養成分計算</h2>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="font-bold">任意表示の単位</span>
              <select
                className="rounded border p-3"
                value={nutritionMode}
                onChange={(e) =>
                  setNutritionMode(e.target.value as "piece" | "gram")
                }
              >
                <option value="piece">個あたり</option>
                <option value="gram">gあたり</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="font-bold">任意表示の数量</span>
              <input
                className="rounded border p-3"
                type="number"
                value={nutritionAmount}
                onChange={(e) => setNutritionAmount(e.target.value)}
              />
            </label>
          </div>

          <div className="overflow-x-auto">
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
                  <td className="p-3 text-right">
                    {totalNutrition.energy.toFixed(1)} kcal
                  </td>
                  <td className="p-3 text-right">
                    {totalNutrition.protein.toFixed(1)} g
                  </td>
                  <td className="p-3 text-right">
                    {totalNutrition.fat.toFixed(1)} g
                  </td>
                  <td className="p-3 text-right">
                    {totalNutrition.carbs.toFixed(1)} g
                  </td>
                  <td className="p-3 text-right">
                    {totalNutrition.salt.toFixed(2)} g
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="p-3">1個あたり</td>
                  <td className="p-3 text-right">
                    {nutritionPerPiece.energy.toFixed(1)} kcal
                  </td>
                  <td className="p-3 text-right">
                    {nutritionPerPiece.protein.toFixed(1)} g
                  </td>
                  <td className="p-3 text-right">
                    {nutritionPerPiece.fat.toFixed(1)} g
                  </td>
                  <td className="p-3 text-right">
                    {nutritionPerPiece.carbs.toFixed(1)} g
                  </td>
                  <td className="p-3 text-right">
                    {nutritionPerPiece.salt.toFixed(2)} g
                  </td>
                </tr>

                <tr>
                  <td className="p-3">
                    {nutritionAmount || 0}
                    {nutritionMode === "piece" ? "個あたり" : "gあたり"}
                  </td>
                  <td className="p-3 text-right">
                    {customNutrition.energy.toFixed(1)} kcal
                  </td>
                  <td className="p-3 text-right">
                    {customNutrition.protein.toFixed(1)} g
                  </td>
                  <td className="p-3 text-right">
                    {customNutrition.fat.toFixed(1)} g
                  </td>
                  <td className="p-3 text-right">
                    {customNutrition.carbs.toFixed(1)} g
                  </td>
                  <td className="p-3 text-right">
                    {customNutrition.salt.toFixed(2)} g
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            onClick={copyNutritionLabel}
            className="mt-4 rounded bg-green-600 px-6 py-3 font-bold text-white"
          >
            栄養成分表示をコピー
          </button>

          <p className="mt-4 text-sm text-gray-500">
            ※ gあたり表示は、配合合計重量を基準に計算しています。
          </p>
        </div>
      </div>
    </main>
  );
}