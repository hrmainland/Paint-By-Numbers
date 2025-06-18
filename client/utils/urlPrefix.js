var baseUrl;

if (import.meta.env.NODE_ENV === "production") {
  baseUrl = "";
} else {
  baseUrl = "/api";
}

export default baseUrl;
