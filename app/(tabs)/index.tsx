import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

type Product = {
  id: string;
  price: number | null;
  name: string;
  image: string | null;
  history: number[];
};

const STORAGE_KEY = "product_ids";

export default function HomeScreen() {
  const [ids, setIds] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (targetIds: string[]) => {
    setLoading(true);
    try {
      const results: Product[] = [];

      for (const id of targetIds) {
        const apiUrl = `https://snk-server-1.onrender.com/price/${id}`;
        console.log("fetch url:", apiUrl);

        const res = await fetch(apiUrl);
        const text = await res.text();

        console.log("status:", res.status);
        console.log("raw:", text.slice(0, 200));

        // JSONじゃない（502やHTML）の場合
        if (!text.startsWith("{")) {
          results.push({
            id,
            price: null,
            name: "取得失敗",
            image: null,
            history: [],
          });
          continue;
        }

        const data = JSON.parse(text);

        const existing = products.find((p) => p.id === id);
        const history = existing?.history || [];

        if (data.price) {
          history.push(data.price);
        }

        results.push({
          ...data,
          history,
        });
      }

      setProducts(results);
    } catch (err) {
      console.log("取得エラー", err);
    } finally {
      setLoading(false);
    }
  };

  const loadIds = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    const loadedIds = ["730956"];
    setIds(loadedIds);
    fetchProducts(loadedIds);
  };

  const addProduct = async () => {
    const match = url.match(/apparels\/(\d+)(?:\?|$)/);
    if (!match) return;

    const newId = match[1];
    const nextIds = Array.from(new Set([...ids, newId]));

    setIds(nextIds);
    setUrl("");
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    fetchProducts(nextIds);
  };

  useEffect(() => {
    loadIds();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>商品一覧</Text>

      <TextInput
        style={styles.input}
        placeholder="SNKRDUNKのURLを貼る"
        value={url}
        onChangeText={setUrl}
      />

      <Button title="商品を追加" onPress={addProduct} />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>読み込み中...</Text>
        </View>
      )}

      {products.map((item) => (
        <View key={item.id} style={styles.card}>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.image} />
          )}

          <Text style={styles.name}>{item.name}</Text>

          <Text style={styles.price}>
            {item.price ? `${item.price.toLocaleString()} 円` : "価格取得失敗"}
          </Text>

          {/* グラフ */}
          {item.history.length > 1 && (
            <LineChart
              data={{
                labels: item.history.map((_, i) => `${i + 1}`),
                datasets: [{ data: item.history }],
              }}
              width={Dimensions.get("window").width - 40}
              height={200}
              yAxisSuffix="円"
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: () => "#ff0000",
              }}
              style={{ marginTop: 10 }}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  center: {
    alignItems: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    marginTop: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  image: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  name: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },
});
