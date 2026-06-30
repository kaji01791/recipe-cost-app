"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Recipe = {
  id: number;
  name: string;
  yield_count: number;
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [name, setName] = useState("");
  const [yieldCount, setYieldCount] = useState("");

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert("取得エラー: " + error.message);
      return;
    }

    setRecipes(data || []);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const addRecipe = async () => {
    if (!name || !yieldCount) {
      alert("レシピ名と製造個数は必須です");
      return;
    }

    const { error } = await supabase.from("recipes").insert([
      {
        name,
        yield_count: Number(yieldCount),
      },
    ]);

    if (error) {
      alert("登録エラー: " + error.message);
      return;
    }

    setName("");
    setYieldCount("");
    fetchRecipes();
  };

  const deleteRecipe = async (id: number) => {
    if (!confirm("このレシピを削除しますか？")) return;

    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) {
      alert("削除エラー: " + error.message);
      return;
    }

    fetchRecipes();
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-4xl font-bold text-gray-900">
          レシピ管理
        </h1>

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">レシピを登録</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded border p-3"
              placeholder="レシピ名 例：玄米フィナンシェ"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="rounded border p-3"
              placeholder="製造個数 例：20"
              type="number"
              value={yieldCount}
              onChange={(e) => setYieldCount(e.target.value)}
            />
          </div>

          <button
            onClick={addRecipe}
            className="mt-4 rounded bg-black px-6 py-3 font-bold text-white"
          >
            追加する
          </button>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">レシピ一覧</h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">レシピ名</th>
                <th className="p-3 text-right">製造個数</th>
                <th className="p-3 text-center">操作</th>
              </tr>
            </thead>

            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="border-b">
                  <td className="p-3">{recipe.name}</td>
                  <td className="p-3 text-right">{recipe.yield_count}個</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="rounded bg-red-600 px-3 py-1 text-white"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recipes.length === 0 && (
            <p className="mt-4 text-gray-500">
              まだレシピが登録されていません。
            </p>
          )}
        </div>
      </div>
    </main>
  );
}