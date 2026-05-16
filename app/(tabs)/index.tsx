import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const [price, setPrice] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://snk-server.onrender.com/price")
      .then((res) => res.json())
      .then((data) => {
        setPrice(data.price);
        setName(data.name);
        setImage(data.image);
      })
      .catch((err) => {
        console.error(err);
      });
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

      <Text style={styles.price}>{price} 円</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000000",
  },
  loading: {
    marginTop: 10,
    fontSize: 16,
    color: "#000000",
  },
  name: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "center",
    color: "#000000",
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    color: "#000000",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginVertical: 10,
  },
});
