import { Alert } from "react-native";

export const onErrorDisplay = ({ error }) => {
  const msg =
    error?.response?.data?.message ||
    "Oops! Something went wrong. Please try again later, or contact support for assistance.";

  Alert.alert("Warning", msg);
};
