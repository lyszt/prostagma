const DEV_URL = "http://localhost:4000";
const PRODUCTION_URL = "";
const IS_DEV = import.meta.env.MODE === "development";

const BASE_URL = IS_DEV ? DEV_URL : PRODUCTION_URL;
const API_URL = new URL("/api/", BASE_URL).href;

export { DEV_URL, PRODUCTION_URL, IS_DEV, API_URL, BASE_URL };
