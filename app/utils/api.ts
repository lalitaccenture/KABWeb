import axios from 'axios';

const API_BASE_URL = 'https://example.com';


export const signUp = async (payload:any) => {
  try {
    const response = await axios.post(`https://lees1ddoaifunc02.azurewebsites.net/api/register_user?code=girr3ajyJHL7Q9IDV0Soww7NgHMBsztJFiPAm1f6OdEVAzFuTy8e1w==`, payload);
    return response.data;
  } catch (error) {
    console.error("Error signing up", error);
    throw error;  
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`https://lees1ddoaifunc02.azurewebsites.net/api/login_user?code=R_rE5s1vP6u7a9IIvYEZwy2xuRVs4x647AiwkyJouaroAzFuE45tPw==`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("data",data);
    if (response.ok) {
        return data; // Return token and user data
    } else {
        throw new Error(data.message || 'Authentication failed');
    }
} catch (error) {
    console.error('Login failed:', error);
    throw error;
}
};


export const sendOtp = async (payload:any) => {
  try {
    const response = await axios.post(`https://lees1ddoaifunc02.azurewebsites.net/api/request_reset_otp_user?code=BZAq20hWl2MnkpJ48xXZCp8yCCEMmiHNQ_340OYEsHC9AzFuHbdttA==`, payload);
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;  
  }
};

export const resetPassword = async (payload:any) => {
  try {
    const response = await axios.post(`https://lees1ddoaifunc02.azurewebsites.net/api/reset_password_user?code=ENTzqWeNUghKqW40pifDBLHf-IyXAu6AZa_Hz22sxdoCAzFuPJXv6Q==`, payload);
    return response.data; 
  } catch (error) {
    console.error("Error reseting password", error);
    throw error;  
  }
};


export const getAnalysisExternalData = async () => {
  try {
    const response = await axios.get(`https://lees1ddoaifunc02.azurewebsites.net/api/dropdowns?code=FoePhKLvfWH_LGw8OJZb4R7RvT-OVu3feFZMqXgMzyG4AzFuTxt59w==`);
    return response.data; 
  } catch (error) {
    console.error("Error calling analysis data", error);
    throw error;  
  }
};

export const applyFilter = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/analytics-map?code=w4wKU6JA5ZMnukZbMXoMDR2pvkAnjp-ffhaOLzwHgE4aAzFufDYkEg==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getAnalysisKABDropdown = async () => {
  try {
    const response = await axios.get(`https://lees1ddoaifunc02.azurewebsites.net/api/kabdropdowns?code=hJErV5lp0GAnYqyAVTSG8Yvl4ubs_oEuhNVmHSST0AKaAzFuNGrVIA==`);
    return response.data;
  } catch (error) {
    console.error("Error calling analysis data", error);
    throw error;  
  }
};




export const getAnalysisKABData =async (queryParams: any = {}) =>{
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/analytics-mapkab?code=3LKHP94BmzdoV3U0Cdommu9mb8mcdnTPTtDFFWFpOKogAzFuWyQjRA==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
}

export const analysisNewDropdown = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/dropdownswithfilter?code=ZNyDSFOcqowWb8iqnQKUrnSVIDN2uTC8f0pfsw8MSBQOAzFu8MS8IQ==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};


export const getHeatMap = async () => {
  try {
    const response = await axios.get(`https://lees1ddoaifunc02.azurewebsites.net/api/analytics-heatmap?code=wAv_2sEbNaYYfkgnWzahhrHr0JkKAoUA09SqBGKRzlKGAzFurrR-iA==`);
    return response.data;
  } catch (error) {
    console.error("Error calling analysis data", error);
    throw error;  
  }
};


export const getAnalysis = async () => {
  try {
    const response = await axios.get(`https://lees1ddoaifunc02.azurewebsites.net/api/analytics?code=TTjA-k1_9asiNJCI676ZgF_ZuoHcNUGydAqM3X7oj21NAzFurtJrGg==`);
    return response.data;
  } catch (error) {
    console.error("Error calling analysis data", error);
    throw error;  
  }
};

export const getAnalysisDashboard = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/analyticsdashboard?code=zwOPEiT5HiB8wklpeuZAOmp_XKbdiEyC6fWrcRZp6SUDAzFuIQW8Fg==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getAnalysisDashboardMap = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/analyticsdashboardmap?code=ChdHGtJ0RYzahIr44gsWvNRwidq2XSv4tc_I3qyAuDNnAzFuODzP-A==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};



export const getPredictionDashboard = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/predictiondashboard?code=F5DZFMrStzMzI_ca9F4l9a86PFetAqFxuhdDHSkELuQCAzFuIRppbA==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};


export const predictionNewDropdown = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/predictiondropdownswithfilter?code=0rTIqa65BxB5PwWX_TnMn13ieVU1sZWnGXArbbCslvz1AzFugwchkA==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const analysisNewDropdownWithCity = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/dropdownswithcityfilter?code=4vc0Z9mm2Hjni2l3dBFeZXQjcPpRzV54GLCfmaHVbsUVAzFuz-ZkLA==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getAnalysisDashboardWithCity = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/analyticsdashboardcity?code=vOJ-CWvru0NCq1xwMHV0jaopUEBsirskDlI3U50YA_8ZAzFuSbHHuA==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getAnalysisDashboardMapCity = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/analyticsdashboardcitymap?code=5dUwuIzfDexgxKxauopz8llaOiZuYh4qSei2VWGlHNPAAzFuea9yLg==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};


export const getPredictionDashboardMap = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/centroidprediction?code=B1Ra1V3sblInyL3tguEIaePFPnOpgqxjk87QxJycPTWfAzFu6EhiDw==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getPredictionMap = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/mapprediction?code=taSky08ckOgJ0QHw-o8JR0Q-Xaz9zt9tYpuVqEtGWd_uAzFua2a3Kw==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getDashboardPrediction = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/dashboardPrediction?code=qSJiX0It367Jz8EJxRnMJc_Pul22ikoZoP3MKXF18lQgAzFuw32_WQ==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getEventPrediction = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/eventBasedPrediction?code=013AV8Z_fAe-3pX0VhFkxFGEFJM0wR67PxaLtMviwULkAzFuT055Uw==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};


export const getBinPrediction = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/binsBasedPrediction?code=iE68FtFMDeoP5LGFAkqYzN1HtimSbg706zTRbn1JC6rDAzFuThGlkQ==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getAmenitiesPrediction = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/amenitiesBasedPrediction?code=_eBQrXlvqAoRx1z1l_4u-8LLvUgDCFa7cmv6VcJUujsbAzFuTQ7oCg==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getViewProfile = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.post(
      `https://lees1ddoaifunc02.azurewebsites.net/api/view_profile?code=EMK6Ur3djVu2a0wxHtYx_r4LzJF31l93abdRBe1YHOZmAzFuGSqfkA==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const postEditProfile = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.post(
      `https://lees1ddoaifunc02.azurewebsites.net/api/edit_profile?code=1_qUfaHVY-8-7lLpDwf-2ahNwc2NFulrZ27tw-04520PAzFueMrY8A==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getAmenities = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/amenitiesBasedOnCategoryPrediction?code=MUKis-alp7qJfU9uB4OAzj-mQbcr0jZsKqazkGwkbiAkAzFuAvTFrg==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getPredictionMapNew = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/mapPredictionWithToolTip?code=vz1ck-TLyXGEaEx56a7OHYGR0YuZqun0sFMDpZGAEzQkAzFuxGYs5A==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

export const getDashboardPredictionNew = async (queryParams: any = {}) => {
  try {
    
    const response = await axios.get(
      `https://lees1ddoaifunc02.azurewebsites.net/api/dashboardPredictionUpdated?code=Uu9Ybd36DqsMzPE1L2D8ZrC7_DSZUr9RqmxLquD3K4xoAzFuTyL8Ng==`,
      { params: queryParams } 
    );
    return response.data;
  } catch (error) {
    console.error("Error applying filter", error);
    throw error;
  }
};

