'use client';

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
    "Litter Quantity": number;  // Sum of All Item Type (renamed)
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

const AnalysisKAB = () => {
    const [markers, setMarkers] = useState<RawMarkerData[]>([]);
    const [zoom, setZoom] = useState<number>(4);
    const [center, setCenter] = useState<[number, number]>([37.0902, -95.7129]);
    const [filters, setFilters] = useState<Filters>({
        state: null,
        parameter: null,
    });
    const [showTooltip, setShowTooltip] = useState(false);
    const [showGeoJSON, setShowGeoJSON] = useState(true);
    const [correlationCoeff, setCorrelationCoeff] = useState<any>(null);
    const [dataForScatterChart,setDataForScatterChart]  = useState([])
    const [statesData, setStatesData] = useState<any[]>([]);
    const [dropDown,setDropDown] = useState([])
    const [analysisData,setAnalysisData] = useState<any>([])
    const [loadingAnalysisData, setLoadingAnalysisData] = useState<boolean>(false);
  const [loadingExternalData, setLoadingExternalData] = useState<boolean>(false);
  const [loadingMapData, setLoadingMapData] = useState<boolean>(false)
  const [forScatter,setForscatter] = useState<any>([]);
  const [stateInfoFORGEOJSON,setStateInfoFORGEOJSON] = useState<any>([]);
  const [coefficientVal,setCoefficientVal] = useState<number>();
    const isFirstRender = useRef(true);
    const isNavigating = useRef(false);
    const router = useRouter();
    interface DataItem {
        [key: string]: number | string; // Assuming the values are either numbers or strings
      }

      const fetchData = async ()=>{
        setLoadingExternalData(true);
  setLoadingAnalysisData(true);
        try{
const data = await getAnalysisKABDropdown();
setStatesData(data?.States)
setDropDown(data["Parameter Name"])

setLoadingExternalData(false);
const dataForAnalytics = await getAnalysisKABData();
setAnalysisData(dataForAnalytics)
setMarkers(dataForAnalytics?.gps_data)
setForscatter(dataForAnalytics?.correlation_analysis)
setCorrelationCoeff(data["Parameter Name"][0])
setCoefficientVal(dataForAnalytics?.all_correlation_coefficients[data["Parameter Name"][0]?.value])
const heatMapData = await getHeatMap();
setStateInfoFORGEOJSON(heatMapData);
// // @ts-ignore: Ignore TypeScript error
// const val = transformData(dataForAnalytics?.correlation_analysis[correlationCoeff?.value]?.scatter_plot);
//     // @ts-ignore: Ignore TypeScript error
//     setDataForScatterChart(val);
    
setLoadingAnalysisData(false);

        }

        catch(error){
            setLoadingAnalysisData(false);
            setLoadingExternalData(false);
        }

    }
    useEffect(()=>{
        

        fetchData()
    },[])
console.log("markers",markers)
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
      console.log("correlationCoeff",correlationCoeff)

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
        try{
            
    // @ts-ignore: Ignore TypeScript error
            const val = transformData(forScatter[correlationCoeff?.value]?.scatter_plot);
            // @ts-ignore: Ignore TypeScript error
            setDataForScatterChart(val);
        }
        catch(error){
            //toast.error('There was some issue with fetching data');
            console.log("Error")
        }
        
    }, [correlationCoeff]); 
    // Only trigger when correlationCoeff changes

    const data = {
        labels: Object.keys(analysisData?.litter_pie_chart || {}),
        datasets: [
            {
                label: '# of Votes',
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
            position: 'bottom', // Ensure the legend is on the right
            labels: {
              boxWidth: 10,
              boxHeight: 8,
              padding: 10,
              font: {
                size: 12,
              },
            },
          },
          datalabels: {
            formatter: (value, context) => {
              // Type assertion to treat dataset as numbers
              const dataset = context.chart.data.datasets[0].data as number[];
      
              // Sum only numeric values
              const total = dataset.reduce((acc, val) => acc + val, 0);
      
              return `${((value as number / total) * 100).toFixed(1)}%`;
            },
            color: '#000',
            font: {
              weight: 'bold',
              size: 14,
            },
            align: 'end',
            anchor: 'end',
          },
        },
      };

      

    return (

<div className="bg-[#5BAA76] bg-opacity-10 flex w-full gap-4 mt-4">



<div style={{ marginTop: "72px", marginLeft: "14px" }} className="p-4 bg-white shadow-lg rounded-lg space-y-6 h-auto max-h-[600px]">


                
                <div className="flex flex-col gap-4">


                    <div>
                        <label htmlFor="state" className="block text-base font-semibold text-black-600 mb-2 font-neris">State</label>
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
                                    backgroundColor: "#5BAA76", // ✅ Prevents blue color on drag
                                  },
                                }),
                                singleValue: (base) => ({
                                  ...base,
                                  color: "#black",
                                  fontWeight: "semibold",
                                }),
                              }}
                        />
                    )}
                    </div>

                    

                    <div  className="mt-4 flex flex-col gap-4">
                        <Button className="w-full bg-[#3AAD73] text-white hover:bg-[#33a060]" disabled={loadingAnalysisData || loadingAnalysisData} onClick={handleApply}>
                            Apply
                        </Button>
                        <Button className="w-full bg-transparent text-black font-bold border border-[#5BAA76] rounded-md hover:bg-[#ffffff] hover:text-black transition"  disabled={filters.state === null && filters.parameter === null} onClick={handleClear}>
                            Clear
                        </Button>
     
                    </div><br></br>
                    <p className="block text-base font-semibold text-black-600 mb-2 font-neris">Map Legend:</p>
                    <div className="flex flex-col items-center mr-[78px]">

  <span className="text-xs text-gray-700">Lower Litter Density</span>
  <div className="w-5 h-24 bg-gradient-to-b from-orange-200 to-red-400 rounded-full my-1"></div>
  <span className="p-3 text-xs text-gray-700 whitespace-nowrap">Higher Litter Density</span>

</div>
<div className="flex items-center gap-2 mt-2">
    <div className="w-2 h-2 bg-green-500"></div> 
    <p className="text-xs text-gray-700">
    Survey Site Litter Data.
    </p>
  </div>

  <div className="flex items-center gap-2 mt-1">
    <div className="w-2 h-2 bg-red-500"></div> 
    <p className="text-xs text-gray-700">
    Statewide Estimated Litter Data.
    </p>
  </div>

                </div>
            </div>
            

     
            
            <div className="w-3/5 p-4 flex flex-col justify-start items-center gap-4">
            <div
  className="absolute top-0 left-1/2 transform -translate-x-1/2 flex gap-4"
  style={{ marginTop: '72px' }}
>

  <button className=   "w-[237px] h-[36px] text-black font-medium border border-[#5BAA76] rounded-md bg-white" onClick={()=>router.push("/analysis-external")}>
    Litter Cleanup Analysis
  </button>
  <button className="w-[237px] h-[36px] text-white font-medium rounded-md bg-[#5BAA76]" onClick={() => router.push("/analysis-kab")}
  >
  Litter Survey Analysis
</button>

</div>
                {/* AnalysisMap section */}
                <div className="w-full h-72 p-4 rounded" style={{ marginTop: '32px' ,marginLeft:'-35px'}}>
<p className="block text-base font-semibold text-black-600 mb-1 font-neris">Litter Density Heatmap: Statewide Estimates & Surveyed Sites:</p><br></br>

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
                markers = {markers}
                />
          )}
      </div>
            {/*     Correlation Between Estimated Litter Density */}
           <div className="mr-[420] mt-14">

           <label htmlFor="parameterName" className="text-base font-semibold font-neris block leading-tight">
  Correlation Between Estimated Litter Density & Surveys
</label>

                        {loadingExternalData ? (
              <div>Loading coefficients...</div>
            ) : (
                        <Select
                            id="parameterName"
                            value={correlationCoeff}
                            onChange={(selectedOption:any) => {
                                setCorrelationCoeff(selectedOption)
                                setCoefficientVal(analysisData?.all_correlation_coefficients[selectedOption?.value])
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
                          className="w-[250px]"
                            isDisabled={!correlationCoeff}
                        />
                        )}
                    </div>
                <div className="w-full flex gap-4">
                  

               {/*  Correlation Between Estimated Litter */}
                
                <div className="w-[341px] h-[249px] p-4 bg-white rounded">

                <p className="text-sm font-medium font-neris text-center relative z-10">
      Correlation Coefficient: 
      <span className="relative inline-block ml-1">
        <b className="text-[#5BAA76] text-lg">{coefficientVal}</b>

        {/* Info Button */}
        <span 
          className="absolute -top-2 -right-4 text-[#5BAA76] text-[10px] font-bold border border-green-600 rounded-full w-3 h-3 flex items-center justify-center cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          i

          {/* Tooltip Box */}
          {showTooltip && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#5BAA76] text-white text-xs rounded-lg px-3 py-1 shadow-lg flex items-center z-50">
              This measures the relationship between variables.
              
              {/* Tooltip Arrow */}
              <div className="absolute left-0 -ml-1 w-2 h-2 bg-[#5BAA76] rotate-45"></div>
            </div>
          )}
        </span>
      </span>
    </p>
<Scatter
  options={{
    plugins: {
      datalabels: {
        display:false
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
          text: correlationCoeff?.label,
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

                    </div>



                    <div className="relative w-1/2">
                    <div className="p-4 bg-white rounded relative h-[251px] ">

    <label className="absolute -top-[85] left-0 text-base font-semibold font-neris">
      Breakdown of Litter Types
    </label>
    {loadingAnalysisData ? (
      <div>Loading doughnut chart...</div>
    ) : (
        <Doughnut data={data} options={optionsDoughnut} style={{ marginLeft: '53px' }} />

    )}
  </div >
  <p  className="absolute bottom-[-20px] right-2 text-xs text-gray-500" >Source: KAB Litter Survey 2020</p>
</div>

                </div>

            </div>

            {/* New Sections in the Right Sidebar */}
            <div className="w-1/5 p-4 space-y-6">
            <div className="p-4 bg-white shadow-lg rounded-lg space-y-6"  style={{ marginTop: "51px"}}>
            <div className="flex items-center gap-2 mt-[-10px]">
    <span className="text-blue-500 text-lg">📅</span> 
    <span className="text-sm font-medium text-gray-500">2020</span>
  </div>
                {/* Total Estimated Litter: */}
                <div className="flex flex-col p-2 rounded-lg bg-white shadow-[0px_4px_6px_-2px_rgba(91,170,118,0.2)]">
                <div className="p-2 rounded flex flex-col gap-3 text-left ml-[-10]">
                <p className="mt-4 text-black text-base font-semibold font-neris whitespace-nowrap">
  Total Estimated Litter:
</p>

                    {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
                    <span className="text-xl font-bold text-green-700">{analysisData?.total_estimated_litter?.toFixed(2)}</span>
            )}
                    </div>
                    </div>


    {/* Estimated Litter Density */}


                <div className="p-2 rounded flex flex-col gap-3">
                    <p className="mt-4 text-black text-base font-semibold font-neris whitespace-nowrap">Estimated Litter Density:</p>
                    {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
                    <span className="text-xl font-bold text-green-700">{analysisData?.estimated_litter_density?.toFixed(2)}</span>
            )}
                    </div>






                {/* Top 3 States Section */}
                <div className="mb-4 p-4 rounded  ml-[-4]">
                    <p className=" mb-2.8 text-black text-base font-semibold font-neris gap-2">Top 3 States:</p>
                 
                    {loadingAnalysisData ? (
            <div>Loading top states...</div>
          ) : (<>
                    {analysisData?.top_3_states?.map((state:any, index:any) => (
       <div key={index} className="flex items-start gap-3 p-2 mb-6 ml-[-4]">
         {/* Dot before each state name */}
         <span className="text-green-700 text-lg font-bold leading-6 ">•</span> 

         {/* State details */}
         <div >
           <p className="text-base font-medium font-neris ">{state.State}</p>
           <p className="text-sm text-gray-500 font-neris ">Estimated: {state.Estimated.toFixed(2)}</p>
           <p className="text-xs text-gray-500 font-neris ">Litter Density: {state["Litter density"].toFixed(2)}</p>
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

export default AnalysisKAB;