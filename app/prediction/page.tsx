'use client';

import dynamic from "next/dynamic";
import Image from "next/image";
import { MdLogout } from "react-icons/md";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { analysisNewDropdown, applyFilter, getAmenitiesPrediction, getAnalysisExternalData, getBinPrediction, getDashboardPrediction, getEventPrediction, getPredictionDashboard, getPredictionDashboardMap, getPredictionMap, predictionNewDropdown } from "../utils/api";
import Switch from "react-switch";
import WeekSelector from "@/src/components/WeekSelector";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
const MapPrediction = dynamic(() => import("../../src/components/PredictionMap"), { ssr: false });
const Select = dynamic(() => import('react-select'), { ssr: false });

interface FilterOption {
  value: string | null;
  label: string;
}

interface Filters {
  state: FilterOption | null;
  county: FilterOption | null;
  tract: FilterOption | null;
  week_id: number | null;
}

interface MarkerData {
  latitude: number;
  longitude: number;
  Litter_density: number;
  GEOID: string;
  Predicted_Qty:number;
  color: string;
  pie_chart:object
}

interface SwitchState {
  bins: boolean;
  events: boolean;
  amenities:boolean
}

// Define the props for the SwitchItem component
interface SwitchItemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onColor: string
}


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  BarElement,
  Title);

  interface EventData {
    Impact: string; 
    "Event count": number;
    latitude: number;
    longitude: number;
    GEOID: string;
    pie_chart: object
  }

  interface BinData {
    latitude: number;
    longitude: number;
  }
  
  interface AmenitiesData extends BinData {
    type: string;
  }

  type Week = {
    week_id: number;
    week: string;
  };

const Prediction = () => {

  const [filters, setFilters] = useState<Filters>({
    state: null,
    county: null,
    tract: null,
    week_id: null
  });
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [zoom, setZoom] = useState<number>(4);
  const [center, setCenter] = useState<[number, number]>([37.0902, -95.7129]);

  const [statesData, setStatesData] = useState<any[]>([]);
  const [countiesData, setCountiesData] = useState<any[]>([]);
  const [tractsData, setTractsData] = useState<any[]>([]);
  const [predictionData, setPredictionData] = useState<any>({});
  const [loadingAnalysisData, setLoadingAnalysisData] = useState<boolean>(false);
  const [loadingExternalData, setLoadingExternalData] = useState<boolean>(false);
  const [loadingMapData, setLoadingMapData] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null);
  const [switches, setSwitches] = useState<SwitchState>({
    bins: false,
    events: false,
    amenities:false
  });
  const [loadingAnalysisNewData, setLoadingAnalysisNewData] = useState<boolean>(false);
  const [weeks,setWeeks] = useState<Week[]>([])
  const [eventData,setEventData] = useState<EventData[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<any>();
  const [loadingEventData,setLoadingEventData] = useState<boolean>(false);
  const [loadingBinData,setLoadingBinData] = useState<boolean>(false);
  const [loadingAmenitiesData,setLoadingAmenitiesData] = useState<boolean>(false);
  const [binData,setBinData] = useState<BinData>();
  const [amenitiesData,setAmenitiesData] = useState<AmenitiesData>();
  const [activeButton, setActiveButton] = useState('prediction')
  const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/"); // Redirect to login page
        }
    }, [status, router]);




  const handleChange = (switchName: keyof SwitchState) => (checked: boolean) => {
    setSwitches((prevState) => ({
      ...prevState,
      [switchName]: checked,
    }));
  };

  const fetchData = async () => {
    setLoadingExternalData(true);
    setLoadingAnalysisData(true);
    setLoadingAnalysisNewData(true);
    setLoadingMapData(true);
    setLoadingEventData(true);
    setLoadingAmenitiesData(true);
    setLoadingBinData(true);
    setError(null);
  
    try {
      
      const dropD = await predictionNewDropdown();
  if (!dropD) throw new Error("Failed to fetch dropdown data");

  setStatesData(dropD?.Dropdown);
  setWeeks(dropD?.Weeks);

  const defaultState = dropD?.Dropdown.find((state: { value: string }) => state.value === "California");
  if (defaultState) {
    setFilters((prev) => ({ ...prev, state: defaultState }));
  }

  const weekId = dropD?.Weeks[0]?.week_id;
        setSelectedWeekId(weekId);
      
  
      
      const [
        dashboardRes,
        mapRes,
        eventRes,
        binRes,
        amenitiesRes
      ] = await Promise.allSettled([
        getDashboardPrediction({ State: "California" }),
        getPredictionMap({ State: "California" }),
        getEventPrediction(),
        getBinPrediction(),
        getAmenitiesPrediction()
      ]);
  
      if (dashboardRes.status === "fulfilled") {
        setPredictionData(dashboardRes.value);
      }
  
      if (mapRes.status === "fulfilled") {
        setMarkers(mapRes.value?.data);
        setZoom(5);
        if (mapRes.value?.centroid !== "No location found") {
          setCenter(mapRes.value?.centroid);
        }
      }
  
      if (eventRes.status === "fulfilled") {
        setEventData(eventRes.value?.data);
      }
  
      if (binRes.status === "fulfilled") {
        setBinData(binRes.value);
      }
  
      if (amenitiesRes.status === "fulfilled") {
        setAmenitiesData(amenitiesRes.value);
      }
  
      if ([dashboardRes, mapRes, eventRes, binRes, amenitiesRes].some(r => r.status === "rejected")) {
        setError("Some data failed to load. Please try again later.");
      }
    } catch (error) {
      console.error("Dropdown API failed:", error);
      setError("Failed to fetch dropdown data.");
    }
  
   
    setLoadingExternalData(false);
    setLoadingAnalysisData(false);
    setLoadingAnalysisNewData(false);
    setLoadingMapData(false);
    setLoadingEventData(false);
    setLoadingAmenitiesData(false);
    setLoadingBinData(false);
  };

  useEffect(() => {
    // const fetchData = async () => {
    //   setLoadingExternalData(true);
    //   setLoadingAnalysisData(true);
    //   setLoadingAnalysisNewData(true);
    //   setLoadingMapData(true);
    //   setLoadingEventData(true);
    //   setLoadingAmenitiesData(true)
    //   setLoadingBinData(true)
    //   setError(null);

    //   try {

    //     const dropD = await predictionNewDropdown();
    //     setStatesData(dropD?.Dropdown)
    //     setWeeks(dropD?.Weeks)
    //     const defaultState = dropD?.Dropdown.find((state: { value: string; }) => state.value === "California");
    //   if (defaultState) {
    //     setFilters(prevFilters => ({ ...prevFilters, state: defaultState }));
    //   }
    //     setSelectedWeekId(dropD?.Weeks[0]?.week_id)
    //     setLoadingAnalysisNewData(false)
    //     setLoadingExternalData(false);
    //     setLoadingAnalysisData(false);
    //     const dataDashboard = await getDashboardPrediction();
    //     setPredictionData(dataDashboard);
    //     // if (dataDashboard?.centroid === "No location found") {

    //     // }
    //     // else {
    //     //   setCenter(dataDashboard?.centroid)
    //     // }
    //       const resp = await getPredictionMap({"State":"California"});
    //       console.log("Raw response:map", resp, typeof resp);
    //       const respm = await getEventPrediction();
    //       console.log("Raw response:eventData", respm, typeof respm);
    //       const binData = await getBinPrediction();
    //       console.log("Raw response:binData", binData, typeof binData);
    //       const amenitiesData = await getAmenitiesPrediction();
    //       console.log("Raw response:amenitiesData", amenitiesData, typeof amenitiesData);
          
          
    //   setMarkers(resp?.data)
    //   setEventData(respm?.data)
    //   setBinData(binData)
    //   setAmenitiesData(amenitiesData)
    //     setLoadingMapData(false);
    //     setLoadingEventData(false)
    //     setLoadingAmenitiesData(false)
    //     setLoadingBinData(false)
    //     // const value = await applyFilter();
    //     // setAnalysisData(value);
        
    //     // setLoadingAnalysisData(false);
    //   } catch (error) {
    //     setError("Failed to fetch data, please try again later.");

    //     setLoadingAnalysisData(false);
    //     setLoadingExternalData(false);
    //     setLoadingAnalysisNewData(false)
    //     setLoadingMapData(false);
    //     setLoadingEventData(false)
    //     setLoadingAmenitiesData(false)
    //     setLoadingBinData(false)
    //   } finally {

    //   }
    // };


   
    
    fetchData();
  }, []);



  const handleFilterChange = (filter: string, selectedOption: any) => {
    if(filter=='state'){
      setFilters(prevFilters => ({
        ...prevFilters,
        [filter]: selectedOption,
        county: null,
        tract: null
      }));
    }
    else if(filter=='county'){
      setFilters(prevFilters => ({
        ...prevFilters,
        [filter]: selectedOption,
        tract: null
      }));
    }

    else 
    setFilters(prevFilters => ({
      ...prevFilters,
      [filter]: selectedOption,
    }));
  };

  const handleDropdownFurther = async (val:string,selectedOption:any)=>{
      try{
        setLoadingAnalysisNewData(true)
        console.log("selectedOption",selectedOption)
        let queryParams;
        if((val=="state")){
        queryParams = {
            state: selectedOption?.value || null,
          };
        }
        else if (val=="county"){
          //setFilters({...filters,tract:null})
          queryParams = {
            state: filters?.state?.value || null,
            county: selectedOption?.value || null,
          };
        }
        
        const dropD = await predictionNewDropdown(queryParams);
        if(val=="state"){
          
          setCountiesData(dropD?.Dropdown)
          setLoadingAnalysisNewData(false)
        }
        else if (val=="county"){
          setTractsData(dropD?.Dropdown)
          setLoadingAnalysisNewData(false)
        }
      }
      catch(error){
        alert("error")
        setLoadingAnalysisNewData(false)
      }
    }

  const handleApply = async () => {

    const queryParams = {
      State: filters.state?.value || null,
      County: filters.county?.value || null,
      TRACTID: filters.tract?.value || null,
      week_id: selectedWeekId || null
    };

    // Filter out undefined values
    const cleanedQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v !== undefined)
    );

    setLoadingAnalysisData(true);
    setLoadingMapData(true);
    setLoadingEventData(true)
    setLoadingAmenitiesData(true)
    setLoadingBinData(true)
    try {
      const results = await Promise.allSettled([
        getDashboardPrediction(queryParams),
        getPredictionMap(queryParams),
        getEventPrediction(queryParams),
        getBinPrediction(queryParams),
        getAmenitiesPrediction(queryParams)
      ]);
    
      const [dashboardRes, mapRes, eventRes, binRes, amenitiesRes] = results;
    
      if (dashboardRes.status === "fulfilled") {
        setPredictionData(dashboardRes.value);
      }
    
      if (mapRes.status === "fulfilled") {
        setMarkers(mapRes.value?.data);
      }
    
      if (eventRes.status === "fulfilled") {
        setEventData(eventRes.value?.data);
      }
    
      if (binRes.status === "fulfilled") {
        setBinData(binRes.value);
      }
    
      if (amenitiesRes.status === "fulfilled") {
        setAmenitiesData(amenitiesRes.value);
      }
    
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Something went wrong while fetching data.");
    }
    
    // Turn off all loaders
    setLoadingAnalysisData(false);
    setLoadingMapData(false);
    setLoadingEventData(false);
    setLoadingAmenitiesData(false);
    setLoadingBinData(false);
  };

  const handleClear = () => {
    setFilters({
      state: null,
      county: null,
      tract: null,
      week_id:null
    });
    fetchData();
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Bar Chart - Stacked',
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
  
  const labels = ['January'];
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Dataset 1',
        data: [60],
        backgroundColor: 'rgb(255, 99, 132)',
      },
      {
        label: 'Dataset 2',
        data: [49],
        backgroundColor: 'rgb(75, 192, 192)',
      },
      {
        label: 'Dataset 3',
        data: [87],
        backgroundColor: 'rgb(53, 162, 235)',
      },
    ],
  };

  const dataDoughnut = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          '#E97132',
          '#196B24',
          '#0F9ED5',
          '#974F91',
          '#DE9ED8',
          '#AAB4B8',
        ],
        borderColor: [
          '#E97132',
          '#196B24',
          '#0F9ED5',
          '#974F91',
          '#DE9ED8',
          '#AAB4B8',
        ],
        borderWidth: 1,
      },
    ],
  };

  const isClearButtonEnabled = Object.values(filters).some((value) => value !== null);

  const SwitchItem: React.FC<SwitchItemProps> = ({ label, checked, onChange, onColor = "#00FF00" }) => (
    <div className="flex items-center space-x-2">
      <Switch 
        onChange={onChange} 
        checked={checked} 
        uncheckedIcon={false} 
        checkedIcon={false} 
        onColor={onColor}  
        height={20} 
        width={40} 
        handleDiameter={14} 
        activeBoxShadow={`0 0 5px 2px ${onColor}`}
      />  
      <span>{label}</span>
    </div>
  );
  

  console.log("selectedWeekId",selectedWeekId)

  const handleApplySelectedWeek = async (weekID:any) =>{
    const queryParams = {
      State: filters.state?.value || null,
      County: filters.county?.value || null,
      TRACTID: filters.tract?.value || null,
      week_id: weekID || null,
    };
    setLoadingAnalysisData(true);
    setLoadingMapData(true);
    setLoadingEventData(true)
    setLoadingAmenitiesData(true)
    setLoadingBinData(true)
    try {
      const results = await Promise.allSettled([
        getDashboardPrediction(queryParams),
        getPredictionMap(queryParams),
        getEventPrediction(queryParams),
        getBinPrediction(queryParams),
        getAmenitiesPrediction(queryParams)
      ]);
    
      const [dashboardRes, mapRes, eventRes, binRes, amenitiesRes] = results;
    
      if (dashboardRes.status === "fulfilled") {
        setPredictionData(dashboardRes.value);
      }
    
      if (mapRes.status === "fulfilled") {
        setMarkers(mapRes.value?.data);
      }
    
      if (eventRes.status === "fulfilled") {
        setEventData(eventRes.value?.data);
      }
    
      if (binRes.status === "fulfilled") {
        setBinData(binRes.value);
      }
    
      if (amenitiesRes.status === "fulfilled") {
        setAmenitiesData(amenitiesRes.value);
      }
    
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Something went wrong while fetching data.");
    }
    
    // Turn off all loaders
    setLoadingAnalysisData(false);
    setLoadingMapData(false);
    setLoadingEventData(false);
    setLoadingAmenitiesData(false);
    setLoadingBinData(false);
  }

  
  if (status === "loading") {
    return <p>Loading...</p>; // Prevents UI flickering
}

const handleLogoClick = () => {
  if (status === "authenticated") {
      router.push("/home");
  } else {
      router.push("/");
  }
};
const handleLogout = async () => {
  const confirmLogout = window.confirm("Are you sure you want to log out?");
  if (confirmLogout) {
      await signOut({ redirect: false }); // Prevents full page reload
      router.push("/");
      console.log("Logged out");
  }
  else {
      console.log("Logout canceled");
  }
};


  return (

    <div className="min-h-screen w-full flex p-4"  style={{ backgroundColor: "rgba(91, 170, 118, 0.1)" }}>

<div className="w-1/5 p-4 bg-white shadow-2xl rounded-lg flex flex-col" style={{ marginTop: '-7%', marginLeft: '-2%' }}>
      {/* Top section (Logo + Menu) */}
      <div className="flex flex-col items-center" style={{ marginTop: '-7%' }}>
        <p className="text-[#5BAA76] text-xl font-bold cursor-pointer font-neris" onClick={handleLogoClick}>
          LitterSense
        </p>
        <Image src="/powered.png" alt="Accenture" width={100} height={14} className="object-contain mt-[-4px]" />
      </div>

      <div className="mt-6">
        <p className="text-gray-400 text-sm font-semibold mb-2">Menu</p>
        <div className="flex flex-col gap-2">
        <button
            className={`flex items-center gap-2 p-2 rounded-lg w-full font-neris text-sm ${
              activeButton === 'prediction' ? 'bg-[#DCFCE7] text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => {
              setActiveButton('prediction');
              router.push('/prediction');
            }}
          >
            <span>Prediction</span>
          </button>
          <button
            className={`flex items-center gap-2 p-2 rounded-lg w-full font-neris text-sm ${
              activeButton === 'analysis' ? 'bg-[#DCFCE7] text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => {
              setActiveButton('analysis');
              router.push('/analysis-external');
            }}
          >
            <span>Analysis</span>
          </button>

     
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="flex justify-center mb-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#5BAA76] text-white rounded-lg transition-all hover:bg-[#4A9463]"
            title="Logout"
          >
            <MdLogout size={20} />
            <span>Logout</span>
          </button>
        </div>

        <div className="flex justify-center">
          <p className="text-xs text-gray-600 whitespace-nowrap">
            Keep America Beautiful © Copyright 2025
          </p>
        </div>

        <div className="flex justify-center mt-2">
          <Image src="/kab.png" alt="Logo KAB" width={178} height={28} className="object-contain" />
        </div>
      </div>
    </div>


      <div className="w-3/5 p-4 flex flex-col justify-start items-center gap-4 mt-[-1.5%]">
      <p className="block text-base font-semibold text-black-600  font-neris">Map Controllers</p>
      <div
  className="p-4 rounded-md shadow-md"
  style={{
    background: "white",
    position: "absolute", // Fix it if over map
  width:'56%',
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    maxWidth: "100%",

  }}
>
  <p className="font-semibold text-base mb-2">Filter Prediction Sites</p>
      <div className="flex flex-row gap-4  ">
   

          <div  style={{ 
  width: "max-content", 
  maxWidth: "21%", 
  minWidth: "21%", 
  flex: "0.2",
   
   position: 'relative',
    zIndex: 1000 
}}>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
            {loadingAnalysisNewData ? (
              <div>Loading states...</div>
            ) : (
              <Select
                id="state"
                value={filters.state}
                onChange={(selectedOption) => {handleFilterChange('state', selectedOption)
                  handleDropdownFurther('state',selectedOption)
                }}
                options={statesData}
                placeholder="Select a State"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                    boxShadow:
                      state.isFocused || state.hasValue
                        ? "0px 2px 4px rgba(91, 170, 118, 0.3)" // Always show shadow if selected
                        : "none",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "#5BAA76",
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#C5C5C5",
                  }),
                  option: (base, { isSelected, isFocused }) => ({
                    ...base,
                    backgroundColor: isSelected
                      ? "#5BAA76" // ✅ Selected stays green
                      : isFocused
                      ? "#A5D6A7" // ✅ Light green on hover
                      : "white",
                    color: isSelected ? "white" : "black",
                    fontWeight: isSelected ? "600" : "normal", // ✅ Semi-bold when selected
                    "&:hover": {
                      backgroundColor: "#5BAA76",
                      color: "white",
                    },
                    "&:active": {
                      backgroundColor: "#5BAA76",
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "black", // ✅ Selected value should be black
                    fontWeight: "semibold", // ✅ Selected value should be semi-bold
                  }),
                }}
              />
            )}
          </div>


          <div style={{ 
  width: "max-content", 
  maxWidth: "21%", 
  minWidth: "21%", 
  flex: "0.2" ,
  whiteSpace:'nowrap',
  position: 'relative', 
  zIndex: 1000 
}}>
            <label htmlFor="county" className="block text-sm font-medium text-gray-700">County</label>
            {loadingAnalysisNewData ? (
              <div>Loading counties...</div>
            ) : (
              <Select
                id="county"
                value={filters.county}
                onChange={(selectedOption) => {handleFilterChange('county', selectedOption)
                  handleDropdownFurther('county',selectedOption)
                }}
                options={countiesData}
                isDisabled={!filters?.state?.value}
                placeholder="Select a County"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                    boxShadow:
                      state.isFocused || state.hasValue
                        ? "0px 2px 4px rgba(91, 170, 118, 0.3)" // Always show shadow if selected
                        : "none",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "#5BAA76",
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#C5C5C5",
                    fontSize: "12px",
                  }),
                  option: (base, { isSelected, isFocused }) => ({
                    ...base,
                    backgroundColor: isSelected
                      ? "#5BAA76" // ✅ Selected stays green
                      : isFocused
                      ? "#A5D6A7" // ✅ Light green on hover
                      : "white",
                    color: isSelected ? "white" : "black",
                    fontWeight: isSelected ? "600" : "normal", // ✅ Semi-bold when selected
                    "&:hover": {
                      backgroundColor: "#5BAA76",
                      color: "white",
                    },
                    "&:active": {
                      backgroundColor: "#5BAA76",
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "black", // ✅ Selected value should be black
                    fontWeight: "semibold", // ✅ Selected value should be semi-bold
                  }),
                }}
              />
            )}
          </div>


          <div style={{ 
  width: "max-content", 
  maxWidth: "21%", 
  minWidth: "21%", 
  flex: "0.2" ,
  whiteSpace:'nowrap',
  position: 'relative',
   zIndex: 1000 
}}>
            <label htmlFor="tract" className="block text-sm font-medium text-gray-700">Central Tract</label>
            {loadingAnalysisNewData ? (
              <div>Loading tracts...</div>
            ) : (
              <Select
                id="tract"
                value={filters.tract}
                onChange={(selectedOption) => handleFilterChange('tract', selectedOption)}
                options={tractsData}
                placeholder="Select a Tract ID"
                isDisabled={!filters?.county?.value}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                    boxShadow:
                      state.isFocused || state.hasValue
                        ? "0px 2px 4px rgba(91, 170, 118, 0.3)" // Always show shadow if selected
                        : "none",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "#5BAA76",
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#C5C5C5",
                    fontSize: "12px",
                    
                  }),
                  option: (base, { isSelected, isFocused }) => ({
                    ...base,
                    backgroundColor: isSelected
                      ? "#5BAA76" // ✅ Selected stays green
                      : isFocused
                      ? "#A5D6A7" // ✅ Light green on hover
                      : "white",
                    color: isSelected ? "white" : "black",
                    fontWeight: isSelected ? "600" : "normal", // ✅ Semi-bold when selected
                    "&:hover": {
                      backgroundColor: "#5BAA76",
                      color: "white",
                    },
                    "&:active": {
                      backgroundColor: "#5BAA76",
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "black", // ✅ Selected value should be black
                    fontWeight: "semibold", // ✅ Selected value should be semi-bold
                  }),
                }}
              />
            )}
          </div>


         



    <div className="mt-4 flex flex-row gap-4" style={{ 
  width: "max-content", 
  maxWidth: "21%", 
  minWidth: "21%", 
  flex: "0.2" ,
  whiteSpace:'nowrap'
}}>
            <Button className="w-full bg-[#5BAA76] text-white hover:bg-[#5BAA76]" disabled={loadingAnalysisNewData || loadingAnalysisData}  onClick={handleApply}>
              Apply
            </Button>
           <Button className="w-full bg-transparent text-black font-bold border border-[#5BAA76] rounded-md hover:bg-[#ffffff] hover:text-black transition" disabled={!isClearButtonEnabled} onClick={handleClear}>
  Clear
</Button>

          </div>
         </div> 
</div>


      <div style={{marginTop:'15%'}}>
            <p className="block text-base font-semibold text-black-600  font-neris">Select a week</p>
    {loadingAnalysisData  ? <>Loading...</> :
      // <WeekSelector weeks={weeks} />
      <div className="flex space-x-7">
      {weeks?.map(({ week_id, week }, index) => ( 
  <button
    key={week_id}
    onClick={() => {
      setSelectedWeekId(week_id);
      handleApplySelectedWeek(week_id);
    }}
    disabled={loadingAnalysisData || loadingMapData || index === 2 || index === 3} 
    className={`px-4 py-2 border rounded transition-colors 
      ${selectedWeekId === week_id ? "bg-[#3AAD73] text-white" : "border-[#3AAD73] text-gray-700"} 
      ${index === 2 || index === 3 ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <p className="text-black text-xs font-medium font-neris">{week}</p>
  </button>
))}

    </div>
      
      }
      </div> 
      <p className="block text-base font-semibold text-black-600  font-neris" >Litter Prediction Map:</p>
      <div className="w-full h-96">
             {loadingMapData ? (
            <div className="flex justify-center items-center h-full p-1">
              <span className="text-xl text-gray-400">Loading map...</span>
            </div>
          ) : (
            <MapPrediction markers={markers} zoom={zoom} center={center} switches={switches} eventData={eventData} binData={binData} amenitiesData={amenitiesData}/>
          )}
          
        </div>

        <div className="mt-5 flex items-center gap-2" style={{marginTop:"1px" , marginRight:'23%' }}>


<div className="w-3 h-3 rounded-full " style={{backgroundColor:'rgba(128, 0, 128, 0.4)'}}></div>
<span className="text-gray-400 text-xs font-xs">Cleanup Site - Bubble size reflects the amount of litter collected; more litter means a larger bubble.</span>
</div>


        <div className="w-full flex justify-start items-center gap-8 mt-4">
            {loadingEventData ? <>Loading...</> :
          <SwitchItem label="Events" checked={switches.events} onChange={handleChange("events")} onColor="#00FF00"/>}
          {loadingBinData ? <>Loading...</> :
  <SwitchItem label="Bins" checked={switches.bins} onChange={handleChange("bins")} onColor="#FFA500"/>}
  {loadingAmenitiesData ? <>Loading...</>:
  <SwitchItem label="Amenities" checked={switches.amenities} onChange={handleChange("amenities")} onColor="#0000FF"/>}
  {/* <SwitchItem label="Weather Outlook" checked={switches.weatherOutlook} onChange={handleChange("weatherOutlook")} />
  <SwitchItem label="Type of Area" checked={switches.typeOfArea} onChange={handleChange("typeOfArea")} /> */}
</div>

      
     </div>


      <div className="w-1/5 p-4  space-y-6  bg-white rounded-lg shadow-md" style={{marginLeft:'2%'}}>




      <div className="p-4 bg-[#DCFCE7] rounded flex flex-col justify-center items-center text-center">
                    <p className="mt-4 text-black text-base font-semibold font-neris whitespace-nowrap">Predicted Litter Quantity</p>
                    {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
                    <span className="block text-xl font-bold text-green-700">{predictionData?.total?.["Estimated Litter Density"]}<span className="text-sm text-green-700">(#)</span></span>
            )}
                    </div>


                <div className="p-4 bg-[#DCFCE7] rounded flex flex-col justify-center items-center text-center">
                <p className="mt-4 text-black text-base font-semibold font-neris whitespace-nowrap">
                Predicted Litter Density
</p>

                    {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
                    <span className="block text-xl font-bold text-green-700">{predictionData?.total?.["Total Estimated Litter"]}<span className="text-sm text-green-700">(# / sq. miles)</span></span>
            )}
                    </div>

                    <div className="h-auto">
                    {/* <Bar options={options} data={data} /> */}
                    <div className="h-[300px]">
<Doughnut 
  data={dataDoughnut} 
  options={{
    plugins: {
      legend: {
        display: true,
        position: "bottom",  // Move legend below the chart
        labels: {
          font: {
            size: 10,  // Reduce legend text size
          },
          boxWidth: 12,  // Reduce color box size
          padding: 6,  // Adjust spacing
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  }} 
/>
</div>

                    </div>


      </div>

    </div>


  );
}

export default Prediction;
