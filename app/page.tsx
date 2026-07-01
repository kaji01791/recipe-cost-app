"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [labelName, setLabelName] = useState("");
  const [additives, setAdditives] = useState<string[]>([""]);
  const [allergens, setAllergens] = useState<string[]>([""]);

  const [price, setPrice] = useState("");
  const [amountG, setAmountG] = useState("");
  const [energy, setEnergy] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [salt, setSalt] = useState("");

  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert("取得エラー: " + error.message);
      return;
    }

    setIngredients(data || []);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setName("");
    setLabelName("");
    setAdditives([""]);
    setAllergens([""]);
    setPrice("");
    setAmountG("");
    setEnergy("");
    setProtein("");
    setFat("");
    setCarbs("");
    setSalt("");
  };

  const updateAdditive = (index: number, value: string) => {
    const nextAdditives = [...additives];
    nextAdditives[index] = value;
    setAdditives(nextAdditives);
  };

  const addAdditiveField = () => {
    setAdditives([...additives, ""]);
  };

  const removeAdditiveField = (index: number) => {
    if (additives.length === 1) {
      setAdditives([""]);
      return;
    }

    setAdditives(additives.filter((_, i) => i !== index));
  };

  const getCleanAdditives = () => {
    return additives
      .map((item) => item.trim())
      .filter((item) => item !== "");
  };

  const updateAllergen = (index: number, value: string) => {
    const nextAllergens = [...allergens];
    nextAllergens[index] = value;
    setAllergens(nextAllergens);
  };

  const addAllergenField = () => {
    setAllergens([...allergens, ""]);
  };

  const removeAllergenField = (index: number) => {
    if (allergens.length === 1) {
      setAllergens([""]);
      return;
    }

    setAllergens(allergens.filter((_, i) => i !== index));
  };

  const getCleanAllergens = () => {
    return allergens
      .map((item) => item.trim())
      .filter((item) => item !== "");
  };

  const addIngredient = async () => {
    if (!name || !price || !amountG) {
      alert("材料名、仕入価格、内容量は必須です");
      return;
    }

    const { error } = await supabase.from("ingredients").insert([
      {
        name,
        label_name: labelName || name,
        additives: getCleanAdditives(),
        allergens: getCleanAllergens(),
        price: Number(price),
        amount_g: Number(amountG),
        energy: Number(energy || 0),
        protein: Number(protein || 0),
        fat: Number(fat || 0),
        carbs: Number(carbs || 0),
        salt: Number(salt || 0),
      },
    ]);

    if (error) {
      alert("登録エラー: " + error.message);
      return;
    }

    clearForm();
    fetchIngredients();
  };

  const startEdit = (item: Ingredient) => {
    setEditingId(item.id);
    setName(item.name);
    setLabelName(item.label_name || item.name);

    setAdditives(
      item.additives && item.additives.length > 0 ? item.additives : [""]
    );

    setAllergens(
      item.allergens && item.allergens.length > 0 ? item.allergens : [""]
    );

    setPrice(String(item.price));
    setAmountG(String(item.amount_g));
    setEnergy(String(item.energy));
    setProtein(String(item.protein));
    setFat(String(item.fat));
    setCarbs(String(item.carbs));
    setSalt(String(item.salt));
  };

  const updateIngredient = async () => {
    if (editingId === null) return;

    if (!name || !price || !amountG) {
      alert("材料名、仕入価格、内容量は必須です");
      return;
    }

    const { error } = await supabase
      .from("ingredients")
      .update({
        name,
        label_name: labelName || name,
        additives: getCleanAdditives(),
        allergens: getCleanAllergens(),
        price: Number(price),
        amount_g: Number(amountG),
        energy: Number(energy || 0),
        protein: Number(protein || 0),
        fat: Number(fat || 0),
        carbs: Number(carbs || 0),
        salt: Number(salt || 0),
      })
      .eq("id", editingId);

    if (error) {
      alert("更新エラー: " + error.message);
      return;
    }

    clearForm();
    fetchIngredients();
  };

  const deleteIngredient = async (id: number) => {
    if (!confirm("この原材料を削除しますか？")) return;

    const { error } = await supabase
      .from("ingredients")
      .delete()
      .eq("id", id);

    if (error) {
      alert("削除エラー: " + error.message);
      return;
    }

    fetchIngredients();
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-4xl font-bold text-gray-900">
          原材料管理
        </h1>

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            {editingId ? "原材料を編集" : "原材料を登録"}
          </h2>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="font-bold">材料名</span>
              <input
                className="rounded border p-3"
                placeholder="例：チョコレートA"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="font-bold">原材料表示名</span>
              <input
                className="rounded border p-3"
                placeholder="例：チョコレート"
                value={labelName}
                onChange={(e) => setLabelName(e.target.value)}
              />
            </label>
          </div>

          <div className="mb-6 rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-3 text-lg font-bold">添加物</h3>

            <div className="grid gap-3">
              {additives.map((additive, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 rounded border p-3"
                    placeholder="例：乳化剤"
                    value={additive}
                    onChange={(e) => updateAdditive(index, e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => removeAdditiveField(index)}
                    className="rounded bg-gray-500 px-4 py-2 font-bold text-white"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addAdditiveField}
              className="mt-3 rounded bg-green-600 px-4 py-2 font-bold text-white"
            >
              ＋ 添加物を追加
            </button>
          </div>

          <div className="mb-6 rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-3 text-lg font-bold">アレルゲン</h3>

            <div className="grid gap-3">
              {allergens.map((allergen, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 rounded border p-3"
                    placeholder="例：乳成分 / 小麦 / 卵"
                    value={allergen}
                    onChange={(e) => updateAllergen(index, e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => removeAllergenField(index)}
                    className="rounded bg-gray-500 px-4 py-2 font-bold text-white"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addAllergenField}
              className="mt-3 rounded bg-orange-600 px-4 py-2 font-bold text-white"
            >
              ＋ アレルゲンを追加
            </button>

            <p className="mt-3 text-sm text-gray-500">
              例：乳ではなく「乳成分」と入力しておくと、原材料表示で使いやすくなります。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <input
              className="rounded border p-3"
              placeholder="仕入価格 円"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <input
              className="rounded border p-3"
              placeholder="内容量 g"
              type="number"
              value={amountG}
              onChange={(e) => setAmountG(e.target.value)}
            />

            <input
              className="rounded border p-3"
              placeholder="エネルギー kcal/100g"
              type="number"
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
            />

            <input
              className="rounded border p-3"
              placeholder="たんぱく質 g/100g"
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />

            <input
              className="rounded border p-3"
              placeholder="脂質 g/100g"
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
            />

            <input
              className="rounded border p-3"
              placeholder="炭水化物 g/100g"
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />

            <input
              className="rounded border p-3"
              placeholder="食塩相当量 g/100g"
              type="number"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
            />
          </div>

          <div className="mt-4 flex gap-3">
            {editingId ? (
              <>
                <button
                  onClick={updateIngredient}
                  className="rounded bg-blue-600 px-6 py-3 font-bold text-white"
                >
                  更新する
                </button>

                <button
                  onClick={clearForm}
                  className="rounded bg-gray-500 px-6 py-3 font-bold text-white"
                >
                  キャンセル
                </button>
              </>
            ) : (
              <button
                onClick={addIngredient}
                className="rounded bg-black px-6 py-3 font-bold text-white"
              >
                追加する
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">原材料一覧</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">材料名</th>
                  <th className="p-3 text-left">原材料表示名</th>
                  <th className="p-3 text-left">添加物</th>
                  <th className="p-3 text-left">アレルゲン</th>
                  <th className="p-3 text-right">仕入価格</th>
                  <th className="p-3 text-right">内容量</th>
                  <th className="p-3 text-right">1g単価</th>
                  <th className="p-3 text-right">kcal</th>
                  <th className="p-3 text-right">P</th>
                  <th className="p-3 text-right">F</th>
                  <th className="p-3 text-right">C</th>
                  <th className="p-3 text-right">塩分</th>
                  <th className="p-3 text-center">操作</th>
                </tr>
              </thead>

              <tbody>
                {ingredients.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">{item.name}</td>

                    <td className="p-3">
                      {item.label_name || item.name}
                    </td>

                    <td className="p-3">
                      {item.additives && item.additives.length > 0
                        ? item.additives.join("、")
                        : "-"}
                    </td>

                    <td className="p-3">
                      {item.allergens && item.allergens.length > 0
                        ? item.allergens.join("、")
                        : "-"}
                    </td>

                    <td className="p-3 text-right">{item.price}円</td>

                    <td className="p-3 text-right">{item.amount_g}g</td>

                    <td className="p-3 text-right">
                      {(item.price / item.amount_g).toFixed(2)}円
                    </td>

                    <td className="p-3 text-right">{item.energy}</td>
                    <td className="p-3 text-right">{item.protein}</td>
                    <td className="p-3 text-right">{item.fat}</td>
                    <td className="p-3 text-right">{item.carbs}</td>
                    <td className="p-3 text-right">{item.salt}</td>

                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="rounded bg-blue-600 px-3 py-1 text-white"
                        >
                          編集
                        </button>

                        <button
                          onClick={() => deleteIngredient(item.id)}
                          className="rounded bg-red-600 px-3 py-1 text-white"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ingredients.length === 0 && (
            <p className="mt-4 text-gray-500">
              まだ原材料が登録されていません。
            </p>
          )}
        </div>
      </div>
    </main>
  );
}