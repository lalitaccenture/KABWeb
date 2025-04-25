'use client';
import Image from "next/image";
import { MdLogout } from "react-icons/md";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartOptions
} from 'chart.js';
import { Doughnut, Scatter } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { applyFilter, getAnalysisKABData, getAnalysisKABDropdown, getHeatMap } from "../utils/api";
import ChartDataLabels from 'chartjs-plugin-datalabels';
const AnalysisKABMap = dynamic(() => import("../../src/components/AnalysisKABMap"), { ssr: false });
const MapAnalysisGEOJSON = dynamic(() => import("../../src/components/AnalysisGeoJSON"), { ssr: false });
const Select = dynamic(() => import('react-select'), { ssr: false });
import value from "../../public/KABAnalytics 1.json"
import { useRouter } from "next/navigation";
import { convertToIntegers, formatNumber, formatNumberMillion } from "@/utils/common";
import { signOut, useSession } from "next-auth/react";


// Define the types for the correlation analysis and selected coefficient
type CorrelationAnalysis = Record<string, { scatter_plot: { [key: string]: number }[] }>;

type CorrelationCoeff = {
  value: keyof CorrelationAnalysis | undefined;  // Allow value to be undefined
  label: string;
};

type Value = {
  correlation_analysis: CorrelationAnalysis;
  litter_pie_chart: Record<string, number>;
  total_estimated_litter: number;
  estimated_litter_density: number;
  top_3_states: { State: string; Estimated: number; "Litter density": number }[];
};

interface RawMarkerData {
  Latitude: number;
  Longitude: number;
  "Litter Quantity": number;
  "Date and Time": string;
  City: string;  // First City
  "Site Area": string;  // First Site Area
  "Site Type": string;  // First Site Type
  "Roadway Type": string;  // First Roadway Type
  "Survey Type": string;  // First Survey Type
}

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartDataLabels,
  Title);
interface FilterOption {
  value: string | null;
  label: string;
}
interface Filters {
  state: FilterOption | null;
  parameter: FilterOption | null;
}

const ScenarioModeling = () => {
  const [markers, setMarkers] = useState<RawMarkerData[]>([]);
  const [zoom, setZoom] = useState<number>(4);
  const [center, setCenter] = useState<[number, number]>([37.0902, -95.7129]);
  const [filters, setFilters] = useState<Filters>({
    state: null,
    parameter: null,
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [showGeoJSON, setShowGeoJSON] = useState(true);
  const [correlationCoeff, setCorrelationCoeff] = useState<any>(null);
  const [dataForScatterChart, setDataForScatterChart] = useState([])
  const [statesData, setStatesData] = useState<any[]>([]);
  const [dropDown, setDropDown] = useState([])
  const [analysisData, setAnalysisData] = useState<any>([])
  const [loadingAnalysisData, setLoadingAnalysisData] = useState<boolean>(false);
  const [loadingExternalData, setLoadingExternalData] = useState<boolean>(false);
  const [loadingMapData, setLoadingMapData] = useState<boolean>(false)
  const [forScatter, setForscatter] = useState<any>([]);
  const [stateInfoFORGEOJSON, setStateInfoFORGEOJSON] = useState<any>([]);
  const [coefficientVal, setCoefficientVal] = useState<number>();
  const [measurementUnit, setMeasurementUnit] = useState()
  const [activeTab, setActiveTab] = useState("survey");
  const isFirstRender = useRef(true);
  const isNavigating = useRef(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClickOutside = (event: MouseEvent) => {
    if (
      tooltipRef.current &&
      event.target instanceof Node &&
      !tooltipRef.current.contains(event.target)
    ) {
      setShowTooltip(false);
    }
  };

  useEffect(() => {
    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/"); // Redirect to login page
    }
  }, [status, router]);
  interface DataItem {
    [key: string]: number | string; // Assuming the values are either numbers or strings
  }

  const fetchData = async () => {
    setLoadingExternalData(true);
    setLoadingAnalysisData(true);
    try {
      const data = await getAnalysisKABDropdown();
      setStatesData(data?.States)
      setDropDown(data["Parameter Name"])


      const dataForAnalytics = await getAnalysisKABData();
      setAnalysisData(dataForAnalytics)
      setMarkers(dataForAnalytics?.gps_data)
      setForscatter(dataForAnalytics?.correlation_analysis)
      setCorrelationCoeff(data["Parameter Name"][0])
      setCoefficientVal(dataForAnalytics?.all_correlation_coefficients[data["Parameter Name"][0]?.value])
      setMeasurementUnit(dataForAnalytics?.correlation_analysis[data["Parameter Name"][0]?.value]?.measurement_unit)
      setLoadingExternalData(false);
      const heatMapData = await getHeatMap();
      setStateInfoFORGEOJSON(heatMapData);
      // // @ts-ignore: Ignore TypeScript error
      // const val = transformData(dataForAnalytics?.correlation_analysis[correlationCoeff?.value]?.scatter_plot);
      //     // @ts-ignore: Ignore TypeScript error
      //     setDataForScatterChart(val);

      setLoadingAnalysisData(false);

    }

    catch (error) {
      setLoadingAnalysisData(false);
      setLoadingExternalData(false);
    }

  }
  useEffect(() => {


    fetchData()
  }, [])
  console.log("markers", markers)
  const transformData = (data: DataItem[]) => {
    // Get the keys of the first item in the data (assuming all objects have the same structure)
    const keys = Object.keys(data[0]);

    return data.map(item => ({
      x: item[keys[0]],
      y: item[keys[1]]   // Use the second key for y (education density)
    }));
  };
  const options = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 10,
          boxHeight: 8,
          padding: 10,
          font: {
            size: 12,
          },
        },
      },
    },
  };
  console.log("correlationCoeff", correlationCoeff)

  const dataForScatter = {
    datasets: [
      {
        label: '',
        data: dataForScatterChart || [],
        backgroundColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  useEffect(() => {
    isNavigating.current = true; // Set to true when navigation happens
  }, [router]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Skip the effect on first render
    }
    // if (isNavigating.current) {
    //     isNavigating.current = false;
    //     return;
    // }
    try {

      // @ts-ignore: Ignore TypeScript error
      const val = transformData(forScatter[correlationCoeff?.value]?.scatter_plot);
      // @ts-ignore: Ignore TypeScript error
      setDataForScatterChart(val);
    }
    catch (error) {
      //toast.error('There was some issue with fetching data');
      console.log("Error")
    }

  }, [correlationCoeff]);
  // Only trigger when correlationCoeff changes

  const data = {
    labels: Object.keys(analysisData?.litter_pie_chart || {}),
    datasets: [
      {

        label: '# of Litter',
        data: Object.values(analysisData?.litter_pie_chart || {}),
        backgroundColor: [
          '#E97132',  // Cigarette (Orange)
          '#196B24',  // Glass (Green)
          '#0F9ED5',  // Plastic (Light Blue)
          '#974F91',  // Rubber (Purple)
          '#DE9ED8',  // Organic (Pink)
          '#AAB4B8',  // Metal (Gray)
          '#E6E6E6',  // Paper (Light Gray)
          '#156082',
        ],
        borderColor: [
          '#E97132',  // Cigarette (Orange)
          '#196B24',  // Glass (Green)
          '#0F9ED5',  // Plastic (Light Blue)
          '#974F91',  // Rubber (Purple)
          '#DE9ED8',  // Organic (Pink)
          '#AAB4B8',  // Metal (Gray)
          '#E6E6E6',  // Paper (Light Gray)
          '#156082',
        ],
        borderWidth: 1,
      },
    ],
  };
  // console.log("test",correlationCoeff,value?.all_correlation_coefficients[correlationCoeff],value?.correlation_analysis[correlationCoeff]?.scatter_plot)



  const topStates = [
    { name: "State 1", placeholder: "State 1 Info" },
    { name: "State 2", placeholder: "State 2 Info" },
    { name: "State 3", placeholder: "State 3 Info" },
  ];

  const handleClear = () => {
    setMarkers([]);
    setFilters({
      state: null,
      parameter: null,
    });
    fetchData();
    setCenter([37.0902, -95.7129]);
    setZoom(4)
  };

  const handleApply = async () => {

    const queryParams = {
      state: filters.state?.value || null,
    };

    console.log("payload", queryParams)
    setLoadingAnalysisData(true);
    try {
      const res = await getAnalysisKABData(queryParams);
      setAnalysisData(res);
      setMarkers(res?.gps_data)
      setZoom(5)
      setCenter(res?.centroid)
      setLoadingAnalysisData(false);

    } catch (error) {
      setLoadingAnalysisData(false);
      console.error("Error:", error);
    }
  };

  const handleFilterChange = (filter: string, selectedOption: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filter]: selectedOption,
    }));

  };

  const heatmapData: [number, number, number][] = [
    [58.3019, -134.4197, 0.5],   // Alaska
    [33.6846, -117.8265, 0.7],   // California
    [39.8283, -98.5795, 0.3],    // Central US (used for other states)
    [41.1254, -98.2688, 0.8],    // Nebraska
    [40.4634, -98.3899, 0.9],    // Kansas
    [41.5887, -93.6208, 0.6],    // Iowa
    [42.7750, -89.0939, 0.4],    // Illinois
    [39.5501, -105.7821, 0.6],   // Colorado
    [42.4072, -71.3824, 0.3],    // Massachusetts
    [40.5515, -75.5298, 0.2],    // Pennsylvania
    [38.8026, -116.4194, 0.5],   // Nevada
    [41.2034, -77.1945, 0.7],    // Pennsylvania
    [34.9697, -92.3731, 0.3],    // Arkansas
    [35.7872, -78.6332, 0.6],    // North Carolina
    [36.7783, -119.4179, 0.7],   // California (example repeated for intensity variation)
    [38.9637, -95.3341, 0.8],    // Kansas
    [34.7465, -92.2896, 0.5],    // Arkansas
    [40.7128, -74.0060, 0.2],    // New York
    [39.7392, -104.9903, 0.6],   // Colorado
    [36.7783, -119.4179, 0.5],   // California
    [35.6895, -80.6749, 0.4],    // South Carolina
    [39.9612, -82.9988, 0.4],    // Ohio
    [40.7128, -74.0060, 0.6],    // New York
    [32.6657, -89.3985, 0.3],    // Mississippi
    [42.7750, -89.0939, 0.5],    // Illinois
    [37.0902, -95.7129, 0.6],    // Missouri
    [29.7633, -95.3633, 0.8],    // Texas
    [36.1147, -96.9200, 0.7],    // Oklahoma
    [33.4484, -112.0740, 0.5],   // Arizona
    [39.3600, -94.6468, 0.6],    // Kansas City, MO (for variation)
    [40.748817, -73.985428, 0.2], // New York City
    [35.2271, -80.8431, 0.3],    // North Carolina
    [40.4406, -79.9959, 0.6],    // Pennsylvania
    [44.0682, -114.7420, 0.3],   // Idaho
    [36.1627, -86.7816, 0.5],    // Tennessee
    [38.5816, -121.4944, 0.7],   // Sacramento, CA
    [40.0673, -75.6982, 0.6],    // Pennsylvania
  ];

  const stateInfo = {
    Alaska: "Alaska, the largest state in the US, known for its rugged terrain and wildlife.",
    California: "California, the most populous state, known for Hollywood, tech, and beautiful beaches.",
    // Add more states with their info...
  };
  const optionsDoughnut: ChartOptions<'doughnut'> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          boxWidth: 12,
          boxHeight: 8,
          padding: 8, // Reduce padding for compact legend
          font: {
            size: 12,
          },
        },
      },
      datalabels: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const dataset = tooltipItem.dataset.data as number[];
            const total = dataset.reduce((acc, val) => acc + val, 0);
            const value = tooltipItem.raw as number;
            const percentage = ((value / total) * 100).toFixed(1);
            return [`# of Litter: ${formatNumberMillion(value)}`, `(${percentage}%)`];
          },
        },
      },

    },
    cutout: "40%", // Keep the inner hole clear
    layout: {
      padding: {
        top: 25,
        bottom: -10, // Reduce bottom padding to fit legend properly
      },
    },
  };


  if (status === "loading") {
    return <p>Loading...</p>; // Prevents UI flickering
  }


  const handleLogoClick = () => {
    if (status === "authenticated") {
      router.push("/analysis-external");
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
    <div className="min-h-screen w-full flex p-4" style={{ backgroundColor: "rgba(91, 170, 118, 0.1)" }}>





      <div className="w-1/5 p-4 bg-white shadow-2xl rounded-lg flex flex-col" style={{ marginTop: '-6.5%', marginLeft: '-1%' }}>

        <div className="flex flex-col items-center" style={{ marginTop: '-6%' }}>
          <p className="text-[#5BAA76] text-xl font-bold cursor-pointer font-neris" onClick={handleLogoClick}>
            LitterSense
          </p>
          <Image src="/powered.png" alt="Accenture" width={100} height={14} className="object-contain mt-[-4px]" />


        </div>

        {/* MENU Section */}
        <div className="mt-6">
          <p className="text-gray-400 text-sm font-semibold mb-2">Menu</p>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 p-2 bg-[#DCFCE7] text-green-700 rounded-lg w-full " onClick={() => router.push("/analysis-external")}>

              <span className="font-neris text-sm">Analysis</span>

            </button>
            <button className="flex items-center gap-2 p-2 bg-gray-100 text-gray-700 rounded-lg w-ful" onClick={() => router.push("/prediction")} >

              <span className="font-neris text-sm">Prediction</span>
            </button>


          </div>
        </div>

        {/* Spacer to push content below */}
        <div className="flex-grow"></div>

        {/* Logout Button */}
        <div className="flex justify-center mb-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#5BAA76] text-white rounded-lg transition-all hover:bg-[#5BAA76]"
            title="Logout"
          >
            <MdLogout size={20} />
            <span>Logout</span>
          </button>
        </div>

        {/* Copyright under the logout button */}
        <div className="flex justify-center">
          <p className="text-xs text-gray-600 whitespace-nowrap">Keep America Beautiful © Copyright 2025</p>
        </div>

        {/* Bottom Logo */}
        <div className="flex justify-center mt-2">
          <Image src="/kab.png" alt="Logo KAB" width={178} height={28} className="object-contain" />
        </div>


      </div>






      <div className="w-3/5 p-4 flex flex-col justify-start items-center gap-4" style={{ maxWidth: '58%', marginLeft: '2%' }}>
        <div className="relative flex bg-[#DCFCE7] p-1 rounded-full shadow-md w-[520px] h-[40px]" style={{ marginTop: '-4%' }}>
          {/* Active Indicator */}
          <div
            className={`absolute top-1 bottom-1 w-[48%] bg-[#1E9E4D] rounded-full transition-all duration-300 ${activeTab === "cleanup" ? "left-1" : "left-[50%]"
              }`}
          ></div>

          {/* Button 1: Litter Cleanup Analysis */}
          <button
            className={`relative w-1/2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${activeTab === "cleanup" ? "text-white" : "text-gray-600"
              }`}
            onClick={() => {
              setActiveTab("cleanup");
              router.push("/analysis-external");
            }}
          >
            Litter Cleanup Analysis
          </button>

          {/* Button 2: Litter Survey Analysis */}
          <button
            className={`relative w-1/2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${activeTab === "survey" ? "text-white" : "text-gray-600"
              }`}
            onClick={() => {
              setActiveTab("survey");
              router.push("/analysis-kab");
            }}
          >
            Litter Survey Analysis
          </button>
        </div>
        <div
          className="p-4 rounded-md shadow-sm"
          style={{ backgroundColor: 'white', marginLeft: '-1%', width: '100%' }}
        >

          <p className="font-semibold text-base mb-2">Filter Survey Sites</p>


          <div className="flex flex-row gap-4 items-end">

            <div style={{ width: '18rem' }}>
              <label htmlFor="state" className="block text-base font-medium text-black-600 mb-2 font-neris">
                State
              </label>
              {loadingExternalData ? (
                <div>Loading states...</div>
              ) : (
                <Select
                  id="state"
                  value={filters.state}
                  onChange={(selectedOption) => handleFilterChange('state', selectedOption)}
                  options={statesData}
                  placeholder="Select a State"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      fontFamily: "'Neris', sans-serif",
                      borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                      boxShadow:
                        state.isFocused || state.hasValue
                          ? "0px 2px 4px rgba(91, 170, 118, 0.3)"
                          : "none",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#5BAA76",
                      },
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#C5C5C5",
                      fontSize: "14px",
                    }),
                    option: (base, { isSelected, isFocused }) => ({
                      ...base,
                      backgroundColor: isSelected
                        ? "#5BAA76"
                        : isFocused
                          ? "#A5D6A7"
                          : "white",
                      color: isSelected ? "white" : "black",
                      "&:active": {
                        backgroundColor: "#5BAA76",
                      },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "#000",
                      fontWeight: "semibold",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      position: "absolute",
                    }),
                  }}
                />
              )}
            </div>


            {/*     <div style={{ width: '15rem' }}>
      <label htmlFor="year" className="block text-base font-medium text-black-600 mb-2 font-neris">
        Year
      </label>
      {loadingExternalData ? (
        <div>Loading years...</div>
      ) : (
        <Select
          id="year"
      
          onChange={(selectedOption) => handleFilterChange('year', selectedOption)}
          options={statesData}
          placeholder="Select a Year"
          styles={{
            control: (base, state) => ({
              ...base,
              fontFamily: "'Neris', sans-serif",
              borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
              boxShadow:
                state.isFocused || state.hasValue
                  ? "0px 2px 4px rgba(91, 170, 118, 0.3)"
                  : "none",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "#5BAA76",
              },
            }),
            placeholder: (base) => ({
              ...base,
              color: "#C5C5C5",
              fontSize: "14px",
            }),
            option: (base, { isSelected, isFocused }) => ({
              ...base,
              backgroundColor: isSelected
                ? "#5BAA76"
                : isFocused
                  ? "#A5D6A7"
                  : "white",
              color: isSelected ? "white" : "black",
              "&:active": {
                backgroundColor: "#5BAA76",
              },
            }),
            singleValue: (base) => ({
              ...base,
              color: "#000",
              fontWeight: "semibold",
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              position: "absolute",
            }),
          }}
        />
      )}
    </div> */}

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                className="bg-[#5BAA76] text-white hover:bg-[#5BAA76] px-4 py-2 rounded-md font-medium"
                disabled={loadingAnalysisData}
                onClick={handleApply}
              >
                Apply
              </Button>
              <Button
                className="bg-white border border-[#5BAA76] text-black px-4 py-2 rounded-md font-medium hover:bg-[#f5f5f5]"
                disabled={!filters.state && !filters.parameter}
                onClick={handleClear}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>


        <p className="block text-base font-semibold text-black-600  font-neris">Litter Density Heatmap: Statewide Estimates & Surveyed Sites (KAB Litter Survey 2020):</p>
        {/* AnalysisMap section */}
        <div
          className="w-full rounded"
          style={{
            marginTop: '10px',
            padding: '10px 0px',
            display: 'block',
            width: '100%'
          }}
        >



          {/* <AnalysisKABMap markers={markers} zoom={zoom} center={center} heatmapData={heatmapData} stateInfo={stateInfo}/> */}
          {loadingAnalysisData ? (
            <div className="flex justify-center items-center h-full">
              <span className="text-xl text-gray-600">Loading map...</span>
            </div>
          ) : (
            <MapAnalysisGEOJSON
              stateInfo={stateInfoFORGEOJSON}
              zoom={zoom}
              center={center} // Center of the U.S.
              showGeoJSON={showGeoJSON}
              markers={markers}
            />
          )}
        </div>

        <div className="flex justify-center items-center gap-4 mt-4" style={{ marginTop: '-20px', marginRight: '38%' }}>
          <span className="text-xs text-gray-400">Lower Litter Density</span>
          <div className="w-20 h-2 bg-gradient-to-r from-[#008000] via-[#FFFF00] to-[#FF0000] rounded-full"></div>
          <span className="text-xs text-gray-400 whitespace-nowrap">Higher Litter Density</span>
          <div className="flex items-center gap-1">
            <img src="/marker-icon.png" alt="Marker" className="w-3 h-5" />
            <span className="text-xs text-gray-400">Survey Site</span>
          </div>
        </div>


        <div className="flex w-full gap-4">
          <div className="w-1/2 p-4 bg-white rounded">

            <div style={{ alignContent: 'center', textAlign: 'center' }}>
              <label htmlFor="parameterName" className="text-base font-semibold font-neris block leading-tight ">
                Correlation Between Estimated Litter Density and
              </label>

              {loadingExternalData ? (
                <div>Loading coefficients...</div>
              ) : (
                <Select
                  id="parameterName"
                  value={correlationCoeff}
                  onChange={(selectedOption: any) => {
                    setCorrelationCoeff(selectedOption)
                    setCoefficientVal(analysisData?.all_correlation_coefficients[selectedOption?.value])
                    setMeasurementUnit(forScatter[selectedOption?.value]?.measurement_unit)

                  }}
                  options={dropDown}
                  placeholder="Select coefficient"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      fontFamily: "'Neris', sans-serif",
                      borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                      boxShadow:
                        state.isFocused || state.hasValue
                          ? "0px 2px 4px rgba(91, 170, 118, 0.3)"
                          : "none",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#5BAA76",
                      },

                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#C5C5C5",
                      fontSize: "14px",
                    }),
                    option: (base, { isSelected, isFocused }) => ({
                      ...base,
                      backgroundColor: isSelected
                        ? "#5BAA76"
                        : isFocused
                          ? "#A5D6A7"
                          : "white",
                      color: isSelected ? "white" : "black",
                      "&:active": {
                        backgroundColor: "#5BAA76",
                      },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "black",
                      fontWeight: "semibold",
                    }),
                  }}
                  className="w-[250px] ml-7"
                  isDisabled={!correlationCoeff}
                />
              )}
            </div>
            <div style={{ marginTop: '5%' }}>
              <span className="text-sm font-medium font-neris text-center relative" style={{ marginLeft: '83px' }} >
                Correlation Coefficient:
                <span className="relative inline-block ml-1 group">
                  <b className="text-[#5BAA76] text-sm font-semibold">{coefficientVal?.toFixed(2)}</b>

                  {/* Info Button */}
                  <button
                    className="absolute -top-2 -right-4 text-[#5BAA76] text-[10px] font-bold border border-green-600 rounded-full w-3 h-3 flex items-center justify-center cursor-default"

                  >
                    i
                  </button>

                  {/* Tooltip appears on hover */}
                  <div
                    ref={tooltipRef}
                    className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#5BAA76] text-white text-xs rounded-lg px-4 py-3 shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{ minWidth: "303px", whiteSpace: "normal", marginLeft: '24px' }}
                  >
                    <span className="font-bold text-sm">Interpreting Correlation Coefficient (r)</span>
                    <ul className="mt-3 text-[13px] leading-[1.5] list-disc pl-3" style={{ marginLeft: '-9px' }}>
                      <li><span className="font-bold">Positive (0 to +1):</span> Both variables increase together</li>
                      <li><span className="font-bold">Negative (0 to -1):</span> One variable increases as the other decreases</li>
                      <li>
                        <span>Strong (±0.7 to ±1.0)</span> |
                        <span> Moderate (±0.3 to ±0.7)</span> |
                        <span> Weak (0 to ±0.3)</span>
                      </li>
                      <li><span>A value near 0 indicates little to no correlation</span></li>
                      <li>
                        <span>
                          Correlation values are from the 2020 KAB survey and may change.<br />
                          Correlation does not imply causation.
                        </span>
                      </li>
                    </ul>
                  </div>
                </span>


              </span>
              {loadingExternalData ?
                <>Loading ...</> :
                <Scatter
                  options={{
                    plugins: {
                      datalabels: {
                        display: false
                      },
                      legend: {
                        display: false, // Hides the legend completely
                      },

                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Estimated Litter Density (#/ sq. miles)",
                        },
                        ticks: {
                          //stepSize: 0.1, // Adjust this based on your dataset
                          autoSkip: false, // Prevent Chart.js from skipping ticks
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: [`${correlationCoeff?.label}`, `(${measurementUnit})`],
                          align: "start"
                        },
                        ticks: {
                          //stepSize: 0.1, // Adjust this based on your dataset
                          autoSkip: false, // Prevent Chart.js from skipping ticks
                        },
                      },
                    },
                  }}
                  data={dataForScatter}
                />
              }
            </div>
          </div>
          <div className="w-1/2 p-4 bg-white rounded" style={{ height: '23rem' }}>


            <p className="text-base font-semibold font-neris" style={{ textAlign: 'center' }}>
              Breakdown of Litter Types
            </p>


            {loadingAnalysisData ? (
              <div>Loading doughnut chart...</div>
            ) : (
              <div className="flex justify-center items-center w-full h-[300px]">
                <Doughnut data={data} options={optionsDoughnut} />
              </div>



            )}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500" >Source: KAB Litter Survey 2020</p>
        </div>
      </div>

      {/* New Sections in the Right Sidebar */}
      <div className="w-1/5 space-y-6" style={{ marginLeft: '2%' }}>
        <div className="p-4 bg-white shadow-lg rounded-lg space-y-6" style={{ marginTop: "3px", height: '69rem' }}>

          {/* Total Estimated Litter: */}
          <div className="flex items-center justify-center p-4 rounded-lg bg-[#DCFCE7] shadow-[0px_4px_6px_-2px_rgba(91,170,118,0.2)]">
            <div className="flex flex-col items-center text-center">
              {/* Value (Number) at the Top */}
              {loadingAnalysisData ? (
                <span>Loading Data...</span>
              ) : (
                <span className="text-2xl font-bold text-green-700">
                  {analysisData?.total_estimated_litter}
                  <span className="text-sm text-green-700"> (#)</span>
                </span>
              )}

              {/* Title Below the Value */}
              <p className="text-black text-base font-semibold font-neris whitespace-nowrap mt-1">
                Total Estimated Litter
              </p>
            </div>
          </div>










          {/* Estimated Litter Density */}


          <div className="p-4 rounded-lg bg-[#DCFCE7] shadow-[0px_4px_6px_-2px_rgba(91,170,118,0.2)] flex flex-col items-center text-center">
            {/* Value at the Top */}
            {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
              <span className="text-2xl font-bold text-green-700">
                {formatNumber(Math.floor(analysisData?.estimated_litter_density))}
                <span className="text-sm text-green-700"> (# / sq. miles)</span>
              </span>
            )}

            {/* Title Below the Value */}
            <p className="text-black text-base font-semibold font-neris mt-1 text-nowrap">
              Estimated Litter Density
            </p>
          </div>








          {/* Top 3 States Section */}
          <div className="mb-4 p-4 rounded" style={{ marginLeft: '-15px' }}>
            <p className="mb-2 text-black text-base font-semibold font-neris">Top 3 States by Est. Litter</p>

            {loadingAnalysisData ? (
              <div>Loading top states...</div>
            ) : (
              <>
                {analysisData?.top_3_states?.map((state: any, index: any) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 mb-4 bg-gray-100 rounded-lg"
                  >
                    {/* Dot before each state name */}
                    <span className="text-green-700 text-lg font-bold leading-6">•</span>

                    {/* State details */}
                    <div>
                      <p className="text-base font-medium font-neris">{state.State}</p>

                      {/* ✅ Fixed Estimated Value Alignment */}
                      <p className="text-xs text-gray-500 font-neris flex items-center">
                        Estimated Litter:
                        <span className="font-semibold text-black text-xs ml-1">
                          {state?.Estimated}
                        </span>
                      </p>

                      <p className="text-xs text-gray-500 font-neris">
                        Litter Density
                        <span className="font-semibold text-black ml-1 text-xs">
                          {formatNumber(Math.trunc(state["Litter density"]))}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>


        </div>
      </div>

    </div>
  );
}

export default ScenarioModeling;