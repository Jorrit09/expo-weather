import { StatusBar } from "expo-status-bar";
import {
  View,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { theme } from "../theme";
import {
  Bars3BottomLeftIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";
import { storeData, getData } from "../utils/asyncStorage";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLocation = (loc) => {
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "14",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData("city", loc.name);
    });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);
  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "Amsterdam";
    if (myCity) cityName = myCity;
    setLoading(true);
    fetchWeatherForecast({
      cityName,
      days: "14",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 600), []);

  const { current, location } = weather;

  return (
    <View className="flex-1 relative">
      <StatusBar style="light"></StatusBar>
      <Image
        blurRadius={100}
        source={require("../assets/images/bg1.png")}
        className="absolute h-full w-full"
      />
      {loading ? (
        <View className="flex-1 flex-row justify-center items-center">
          <Text className="text-white text-4xl">Loading...</Text>
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          <View style={{ height: "7%" }} className="mx-4 relative">
            <View
              className="flex-row justify-end items-center rounded-full"
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : "transparent",
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor={"lightgray"}
                  className="pl-6 h-10 pb-1 flex-1 text-base text-white"
                />
              ) : (
                <Text className="text-white text-2xl font-bold mr-9">
                  {location?.name},
                  <Text className="text-lg font-semibold text-gray-300">
                    {" " + location?.country}
                  </Text>
                </Text>
              )}
              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={{ backgroundColor: theme.bgWhite(0.3) }}
                className="rounded-full p-3 m-1"
              >
                <MagnifyingGlassIcon size="25" color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                {locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder
                    ? " border-b-2 border-b-gray-400"
                    : "";
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      key={index}
                      className={
                        "flex-row items-center border-0 p-3 px-4 mb-1" +
                        borderClass
                      }
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text className="text-black text-lg ml-2">
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            <View className="mx-4 flex justify-around flex-1 mb-2 mt-20">
              <View className="flex-row justify-center">
                <Image
                  source={weatherImages[current?.condition?.text]}
                  className="w-52 h-52 z-0"
                />
              </View>
              <View className="space-y-2 mt-10">
                <Text className="text-center font-bold text-white text-6xl ml-5">
                  {current?.temp_c}&#176;
                </Text>
                <Text className="text-center text-white text-xl tracking-widest">
                  {current?.condition?.text}
                </Text>
              </View>
            </View>
            <View className="mb-2 space-y-3 mt-3">
              <View className="flex-row items-center mx-5 space-x-2">
                <CalendarDaysIcon size="22" color="white" />
                <Text className="text-white text-base">Daily Forecast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 15 }}
                showsHorizontalScrollIndicator={false}
              >
                {weather?.forecast?.forecastday?.map((item, index) => {
                  let date = new Date(item.date);
                  let options = { weekday: "long" };
                  let dayName = date.toLocaleDateString("en-US", options);
                  dayName = dayName.split(",")[0];
                  return (
                    <View
                      key={index}
                      className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                      style={{ backgroundColor: theme.bgWhite(0.15) }}
                    >
                      <Image
                        source={weatherImages[item?.day?.condition?.text]}
                        className="h-11 w-11"
                      />
                      <Text className="text-white">{dayName}</Text>
                      <Text className="text-white text-xl font-semibold">
                        {item?.day?.maxtemp_c}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
            <View className="flex-row justify-between mx-4 mt-4">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/wind.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.wind_kph}km/h
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/drop.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/sun.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mx-5 space-x-2 mt-6">
              <Bars3BottomLeftIcon size="22" color="white" />
              <Text className="text-white text-base">Other Data</Text>
            </View>
            <View className="flex flex-row justify-center items-center py-3 gap-4">
              <View
                style={{ width: "43%", backgroundColor: theme.bgWhite(0.15) }}
                className="py-3 h-32 space-x-3 justify-center rounded-3xl flex-row"
              >
                <Image
                  source={require("../assets/icons/thermometer.png")}
                  className="h-5 w-5"
                />
                <Text className="text-gray-300 pt-1">FEELS LIKE</Text>
                <View className="space-x-3 absolute top-16">
                  <Text className="text-white text-xl font-semibold">
                    {current?.feelslike_c}&#176;
                  </Text>
                </View>
              </View>
              <View
                style={{ width: "43%", backgroundColor: theme.bgWhite(0.15) }}
                className="py-3 h-32 space-x-3 justify-center rounded-3xl flex-row"
              >
                <Image
                  source={require("../assets/icons/rainy.png")}
                  className="h-5 w-5"
                />
                <Text className="text-gray-300 pt-1">EXPECTED RAIN</Text>
                <View className="space-x-3 absolute top-16">
                  <Text className="text-white text-xl font-semibold">
                    {weather?.forecast?.forecastday[0]?.day?.totalprecip_mm} mm
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex flex-row justify-center items-center py-1 gap-4">
              <View
                style={{ width: "43%", backgroundColor: theme.bgWhite(0.15) }}
                className="py-3 h-32 space-x-3 justify-center rounded-3xl flex-row"
              >
                <Image
                  source={require("../assets/icons/drop.png")}
                  className="h-5 w-5"
                />
                <Text className="text-gray-300 pt-1">AVERAGE TEMP</Text>
                <View className="space-x-3 absolute top-16">
                  <Text className="text-white text-xl font-semibold">
                    {weather?.forecast?.forecastday[0]?.day?.avgtemp_c}&#176;
                  </Text>
                </View>
              </View>
              <View
                style={{ width: "43%", backgroundColor: theme.bgWhite(0.15) }}
                className="py-3 h-32 space-x-3 justify-center rounded-3xl flex-row"
              >
                <EyeIcon color="white" size="19" />
                <Text className="text-gray-300 pt-1">VISABILITY</Text>
                <View className="space-x-3 absolute top-16">
                  <Text className="text-white text-xl font-semibold">
                    {current?.vis_km} km
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}
