import {
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";

export default function WeatherScreen() {
  const [toggleSearch, setToggleSearch] = useState(false);
  return (
    <View className={"flex-1 relative"}>
      <StatusBar style="auto" />
      <SafeAreaView className={"flex flex-1 bg-white"}>
        <View
          style={{ height: "7%" }}
          className={"mx-4 rounded-full relative z-50"}
        >
          <View
            className={`flex-row justify-end items-center rounded-full ${toggleSearch ? `bg-gray-700` : `bg-transparent`}`}
          >
            {toggleSearch ? (
              <TextInput
                placeholder="Search city"
                placeholderTextColor={"lightgray"}
                className={"pl-6 h-10 flex-1 text-base text-grey "}
              />
            ) : null}

            <TouchableOpacity
              style={styles.searchIcon}
              className={"rounded-full p-3 pr-3 m-1 bg-gray-700"}
            >
              <FontAwesome6
                name="magnifying-glass"
                size={25}
                color="lightgray"
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchIcon: {
    backgroundColor: "grey",
  },
});
