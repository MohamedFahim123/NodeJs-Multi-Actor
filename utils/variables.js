export const PORT = process.env.PORT || 3000;
export const MONGO_URL = process.env.MONGO_URL;
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^01[0125][0-9]{8}$/,
};
export const availableCategories = [
  "laptops",
  "phones",
  "tablets",
  "accessories",
  "headphones",
  "smartwatch",
  "cameras",
  "monitors",
  "computers",
];
