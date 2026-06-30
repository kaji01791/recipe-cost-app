"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Recipe = {
  id: number;
  name: string;
  yield_count: number;
  selling_price: number;
  package_cost: number;
};

type Ingredient = {
  id: number;
  name: string;
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
  const [packageCost, setPackageCost] = useState("");

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
    setPackageCost(String(recipeData.package_cost || ""));

    const { data: ingredientData } = await supabase
      .from("ingredients")
      .select("*")
      .order("name", { ascending: true });

    setIngredients(ingredientData || []);

    const { data: itemData, error: itemError } = await supabase
      .from("recipe_items")
      .select(`
        id,
        amount_g,
        ingredients (
          id,
          name,
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

  const updatePriceInfo = async () => {
    const { error } = await supabase
      .from("recipes")
      .update({
        selling_price: Number(sellingPrice || 0),
        package_cost: Number(packageCost || 0),
      })
      .eq("id", recipeId);

    if (error) {
      alert("保存エラー: " + error.message);
      return;
    }

    fetchData();
    alert("販売価格・包材原価を保存しました");
  };

  const materialCost = items.reduce((sum, item) => {
    return (
      sum +
      (item.ingredients.price / item.ingredients.amount_g) * item.amount_g
    );
  }, 0);

  const packageCostNumber = Number(packageCost || 0);
  const sellingPriceNumber = Number(sellingPrice || 0);

  const totalCost = materialCost + packageCostNumber;
  const costPerPiece = recipe ? totalCost / recipe.yield_count : 0;

  const profitPerPiece = sellingPriceNumber - costPerPiece;

  const costRate =
    sellingPriceNumber > 0 ? (costPerPiece / sellingPriceNumber) * 100 : 0;

  const profitRate =
    sellingPriceNumber > 0 ? (profitPerPiece / sellingPriceNumber) * 100 : 0;

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
    { energy: 0, protein: 0, fat: 0, carbs: 0, salt: 0 }
  );

  const nutritionPerPiece = recipe
    ? {
        energy: totalNutrition.energy / recipe.yield_count,
        protein: totalNutrition.protein / recipe.yield_count,
        fat: totalNutrition.fat / recipe.yield_count,
        carbs: totalNutrition.carbs / recipe.yield_count,
        salt: totalNutrition.salt / recipe.yield_count,
      }
    : totalNutrition;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          {recipe?.name || "レシピ詳細"}
        </h1>

        <p className="mb-6 text-gray-600">
          製造個数：{recipe?.yield_count}個
        </p>

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">販売価格・包材原価</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              className="rounded border p-3"
              placeholder="販売価格 円"
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />

            <input
              className="rounded border p-3"
              placeholder="包材原価 円"
              type="number"
              value={packageCost}
              onChange={(e) => setPackageCost(e.target.value)}
            />

            <button
              onClick={updatePriceInfo}
              className="rounded bg-blue-600 px-6 py-3 font-bold text-white"
            >
              保存する
            </button>
          </div>
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

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">原材料</th>
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

          {items.length === 0 && (
            <p className="mt-4 text-gray-500">
              まだ配合が登録されていません。
            </p>
          )}
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
              <strong>{packageCostNumber.toFixed(1)}円</strong>
            </p>

            <p>
              総原価：
              <strong>{totalCost.toFixed(1)}円</strong>
            </p>

            <p>
              製造個数：
              <strong>{recipe?.yield_count || 0}個</strong>
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

              <tr>
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
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}