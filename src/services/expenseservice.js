// /**
//  * Fetches expenses from the API
//  * @param {string} authToken - The authentication token
//  * @returns {Promise<Array>} - Promise resolving to expenses array
//  */
// export const fetchExpenses = async (authToken) => {
//     try {
//       if (!authToken) {
//         throw new Error("No auth token provided");
//       }
  
//       const res = await fetch("http://localhost:8000/expenses/", {
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       });
  
//       if (!res.ok) {
//         throw new Error(`Failed to fetch expenses: ${res.status}`);
//       }
  
//       const data = await res.json();
//       return data;
//     } catch (error) {
//       console.error("Error in fetchExpenses service:", error);
//       throw error;
//     }
//   };
  
