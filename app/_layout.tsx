import { useFonts } from "expo-font";
import { Stack } from "expo-router";

export default function RootLayout() {

useFonts({
  'Poppins-regular':require('./../assets/fonts/Poppins-Regular.ttf'),
  'Poppins-medium':require('./../assets/fonts/Poppins-Medium.ttf'),
  'Poppins-bold':require('./../assets/fonts/Poppins-Bold.ttf')
})

  return (
    <Stack screenOptions={{
      headerShown:false
    }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
