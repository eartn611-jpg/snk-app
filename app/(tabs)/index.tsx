import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function HomeScreen() {
  const [price, setPrice] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = () => {
      fetch("https://snk-server.onrender.com/price")
        .then((res) => res.json())
        .then((data) => {
          const newPrice = Number(data.price);

          setPrice(newPrice);
          setName(data.name);
          setImage(data.image);

          setHistory((prev) => [...prev.slice(-9), newPrice]);
        })
        .catch((err) => console.error(err));
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!price) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>SNKRDUNK 価格</Text>
        <ActivityIndicator size="large" />
        <Text style={styles.loading}>取得中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SNKRDUNK 価格</Text>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Text style={styles.name}>{name}</Text>

      <Text style={styles.price}>{price.toLocaleString()} 円</Text>

      {history.length > 1 && (
        <LineChart
          data={{
            labels: history.map((_, i) => `${i + 1}`),
            datasets: [{ data: history }],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          yAxisSuffix="円"
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: () => "#000",
            labelColor: () => "#000",
          }}
          style={styles.chart}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  loading: {
    marginTop: 10,
    color: "#000",
  },
  name: {
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
    color: "#000",
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    color: "#000",
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
    resizeMode: "contain",
  },
  chart: {
    marginTop: 20,
    borderRadius: 10,
  },
});
