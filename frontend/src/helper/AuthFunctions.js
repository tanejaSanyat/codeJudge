import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchProblemsFromExpiredContests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/problemsFromExpiredContests`);
    return response.data; // Assuming response.data is an array of problems
  } catch (error) {
    console.error("Error fetching problems from expired contests:", error);
    throw error;
  }
};

export const fetchContests = async () => {
  try {
    console.log("fet frommauth");
    const response = await axios.get(`${BASE_URL}/getcontests`);
    return response.data;
  } catch (error) {
    console.error("Error fetching contests:", error);
    throw error;
  }
};

export const fetchContestById = async (contestId) => {
  try {
    const response = await axios.get(`${BASE_URL}/contest/${contestId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching contest:", error);
    throw error;
  }
};
