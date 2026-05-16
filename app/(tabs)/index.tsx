import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Product = {
  id: string;
  price: number | null;
  name: string;
  image: string | null;
};

const STORAGE_KEY = "product_ids";

export default function HomeScreen() {
  const [ids, setIds] = useState<string[]>(["730956"]);
  const [url, setUrl] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (targetIds: string[]) => {
    setLoading(true);
    try {
      const results = [];

      for (const id of targetIds) {
        const apiUrl = `https://snk-server-1.onrender.com/price/${id}`;
        console.log("fetch url:", apiUrl);

        const res = await fetch(apiUrl);
        console.log("status:", res.status);

        const text = await res.text();
        console.log("raw:", text.slice(0, 100));

        if (!text.startsWith("{")) {
          console.log("JSONじゃない:", text);
          continue;
        }

        results.push(JSON.parse(text));
      }

      setProducts(results);
    } catch (err) {
      console.log("取得エラー", err);
    } finally {
      setLoading(false);
    }
  };

  const loadIds = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    const loadedIds = saved ? JSON.parse(saved) : [];

    setIds(loadedIds);
    fetchProducts(loadedIds);
  };

  const addProduct = async () => {
    const match = url.match(/(\d+)/);
    if (!match) return;

    const newId = match[1];
    const nextIds = Array.from(new Set([...ids, newId]));

    setIds(nextIds);
    setUrl("");
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    fetchProducts(nextIds);
  };

  useEffect(() => {
    console.log("HomeScreen start");
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
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: "#000",
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
    color: "#000",
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
    color: "#000",
  },
});
