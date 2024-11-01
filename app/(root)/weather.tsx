import {
  StatusBar,
  TextInput,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";

export default function WeatherScreen() {
  const [toggleSearch, setToggleSearch] = useState<boolean>(false);
  const [location, setLocation] = useState<number[]>([1, 2, 3]);
  return (
    <View className={"flex-1 relative"}>
      <StatusBar style="auto" />
      <SafeAreaView className={"flex flex-1 bg-white"}>
        <View
          style={{ height: "7%" }}
          className={"mx-4 rounded-full relative z-50"}
        >
          <View
            className={`flex-row justify-end items-center rounded-full ${
              toggleSearch ? `bg-gray-700` : `bg-transparent`
            }`}
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
              onPress={() => setToggleSearch(!toggleSearch)}
            >
              <FontAwesome6
                name="magnifying-glass"
                size={25}
                color="lightgray"
              />
            </TouchableOpacity>
          </View>

          {location.length > 0 && toggleSearch ? (
            <View>
              {location.map((loc, index) => {
                // Determine if we need a border for this item
                const showBorder = index + 1 !== location.length;
                const borderClass = showBorder
                  ? "border-b-2 border-b-gray-400"
                  : "";

                return (
                  <TouchableOpacity
                    key={index}
                    className={`flex-row items-center border-0 p-3 px-4 mb-1 ${borderClass}`}
                  >
                    <FontAwesome6 name="location-dot" size={24} color="black" />
                    <Text className="ml-2 text-lg text-black">
                      London, United Kingdom
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
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
