'use client';

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title
} from 'chart.js';
import { Doughnut, Scatter } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { applyFilter, getAnalysisKABData, getAnalysisKABDropdown, getHeatMap } from "../utils/api";
const AnalysisKABMap = dynamic(() => import("../../src/components/AnalysisKABMap"), { ssr: false });
const MapAnalysisGEOJSON = dynamic(() => import("../../src/components/AnalysisGeoJSON"), { ssr: false });
const Select = dynamic(() => import('react-select'), { ssr: false });
import value from "../../public/KABAnalytics 1.json"

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
    Title);
interface FilterOption {
    value: string | null;
    label: string;
}
interface Filters {
    state: FilterOption | null;
    parameter: FilterOption | null;
}


// const markersTest: MarkerData[] = [
//     {
//       latitude: 34.0522,
//       longitude: -118.2437,
//       litter_quantity: 120,
//       cleanup_year: 2023,
//     },
//     {
//       latitude: 40.7128,
//       longitude: -74.0060,
//       litter_quantity: 85,
//       cleanup_year: 2022,
//     },
//     {
//       latitude: 41.8781,
//       longitude: -87.6298,
//       litter_quantity: 200,
//       cleanup_year: 2024,
//     },
//     {
//       latitude: 29.7604,
//       longitude: -95.3698,
//       litter_quantity: 50,
//       cleanup_year: 2021,
//     },
//     {
//       latitude: 47.6062,
//       longitude: -122.3321,
//       litter_quantity: 150,
//       cleanup_year: 2023,
//     },
//   ];

const AnalysisKAB = () => {
    const [markers, setMarkers] = useState<RawMarkerData[]>([]);
    const [zoom, setZoom] = useState<number>(4);
    const [center, setCenter] = useState<[number, number]>([37.0902, -95.7129]);
    const [filters, setFilters] = useState<Filters>({
        state: null,
        parameter: null,
    });

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
    const isFirstRender = useRef(true);

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
const heatMapData = await getHeatMap();
setStateInfoFORGEOJSON(heatMapData);
// @ts-ignore: Ignore TypeScript error
const val = transformData(dataForAnalytics?.correlation_analysis[correlationCoeff?.value]?.scatter_plot);
    // @ts-ignore: Ignore TypeScript error
    setDataForScatterChart(val);
    
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
        scales: {
            // y: {
            //     beginAtZero: true,
            // },
        },
    };

    const dataForScatter = {
        datasets: [
            {
                label: 'A dataset',
                data: dataForScatterChart || [],
                backgroundColor: 'rgba(255, 99, 132, 1)',
            },
        ],
    };

    useEffect(() => {
        try{
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return; // Skip the effect on first render
            }
    // @ts-ignore: Ignore TypeScript error
            const val = transformData(forScatter[correlationCoeff?.value]?.scatter_plot);
            // @ts-ignore: Ignore TypeScript error
            setDataForScatterChart(val);
        }
        catch(error){
            toast.error('There was some issue with fetching data');
        }
        
    }, [correlationCoeff]); 
    // Only trigger when `correlationCoeff` changes

    const data = {
        labels: Object.keys(analysisData?.litter_pie_chart || {}),
        datasets: [
            {
                label: '# of Votes',
                data: Object.values(analysisData?.litter_pie_chart || {}),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
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
        //setZoom
        //setCenter
        //setMarkers
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

    //   const stateInfoFORGEOJSON = {
    //     Alabama: { value: 0.4, info: "Alabama is known for its rich Civil Rights history." },
    //     Alaska: { value: 0.2, info: "Alaska is the largest state by area and has vast wilderness." },
    //     Arizona: { value: 0.5, info: "Arizona is home to the Grand Canyon." },
    //     Arkansas: { value: 0.3, info: "Arkansas is the birthplace of Walmart." },
    //     California: { value: 0.9, info: "California's population is over 39 million." },
    //     Colorado: { value: 0.6, info: "Colorado is known for the Rocky Mountains." },
    //     Connecticut: { value: 0.5, info: "Connecticut is home to Yale University." },
    //     Delaware: { value: 0.3, info: "Delaware was the first state to ratify the U.S. Constitution." },
    //     Florida: { value: 0.7, info: "Florida is known for its beaches and warm climate." },
    //     Georgia: { value: 0.6, info: "Georgia is famous for peaches and Coca-Cola." },
    //     Hawaii: { value: 0.4, info: "Hawaii is the only U.S. state made up entirely of islands." },
    //     Idaho: { value: 0.3, info: "Idaho is known for its potato production." },
    //     Illinois: { value: 0.5, info: "Illinois is home to the city of Chicago." },
    //     Indiana: { value: 0.4, info: "Indiana hosts the Indianapolis 500 race." },
    //     Iowa: { value: 0.3, info: "Iowa is known for its corn production." },
    //     Kansas: { value: 0.3, info: "Kansas is the geographical center of the U.S." },
    //     Kentucky: { value: 0.4, info: "Kentucky is famous for bourbon and the Kentucky Derby." },
    //     Louisiana: { value: 0.5, info: "Louisiana is known for its Creole and Cajun culture." },
    //     Maine: { value: 0.3, info: "Maine is famous for its lobster industry." },
    //     Maryland: { value: 0.5, info: "Maryland is home to the U.S. Naval Academy." },
    //     Massachusetts: { value: 0.6, info: "Massachusetts is known for Harvard University." },
    //     Michigan: { value: 0.5, info: "Michigan is famous for the Great Lakes and the auto industry." },
    //     Minnesota: { value: 0.4, info: "Minnesota is known as the Land of 10,000 Lakes." },
    //     Mississippi: { value: 0.3, info: "Mississippi is the birthplace of blues music." },
    //     Missouri: { value: 0.4, info: "Missouri is home to the Gateway Arch in St. Louis." },
    //     Montana: { value: 0.2, info: "Montana is known for Yellowstone National Park." },
    //     Nebraska: { value: 0.3, info: "Nebraska is famous for its cornfields and prairies." },
    //     Nevada: { value: 0.5, info: "Nevada is home to Las Vegas, the entertainment capital." },
    //     "New Hampshire": { value: 0.4, info: "New Hampshire is known for its fall foliage and mountains." },
    //     NewJersey: { value: 0.6, info: "New Jersey has the highest population density in the U.S." },
    //     NewMexico: { value: 0.4, info: "New Mexico is famous for its deserts and Roswell UFO incident." },
    //     NewYork: { value: 0.6, info: "New York is known for the Statue of Liberty and Times Square." },
    //     NorthCarolina: { value: 0.5, info: "North Carolina is known for the Wright brothers' first flight." },
    //     "North Dakota": { value: 0.3, info: "North Dakota has the lowest unemployment rate in the U.S." },
    //     Ohio: { value: 0.5, info: "Ohio is the birthplace of aviation pioneers, the Wright brothers." },
    //     Oklahoma: { value: 0.4, info: "Oklahoma is known for its Native American heritage." },
    //     Oregon: { value: 0.5, info: "Oregon is home to Crater Lake, the deepest lake in the U.S." },
    //     Pennsylvania: { value: 0.6, info: "Pennsylvania is home to the Liberty Bell and Hershey's Chocolate." },
    //     RhodeIsland: { value: 0.3, info: "Rhode Island is the smallest U.S. state by area." },
    //     SouthCarolina: { value: 0.5, info: "South Carolina is known for its historic Charleston district." },
    //     SouthDakota: { value: 0.3, info: "South Dakota is home to Mount Rushmore." },
    //     Tennessee: { value: 0.5, info: "Tennessee is famous for country music and Elvis Presley." },
    //     Texas: { value: 0.8, info: "Texas is the second-largest state by population." },
    //     Utah: { value: 0.4, info: "Utah is known for its national parks and Mormon heritage." },
    //     Vermont: { value: 0.3, info: "Vermont is famous for maple syrup production." },
    //     Virginia: { value: 0.6, info: "Virginia is home to many historical American landmarks." },
    //     Washington: { value: 0.6, info: "Washington state is known for tech companies like Microsoft and Amazon." },
    //     WestVirginia: { value: 0.3, info: "West Virginia is known for its Appalachian Mountains." },
    //     Wisconsin: { value: 0.4, info: "Wisconsin is famous for cheese production." },
    //     Wyoming: { value: 0.2, info: "Wyoming has the lowest population of any U.S. state." }
    //   };
      
      
    //  const dropDown = [
    //     {
    //         "value": "Population_Density",
    //         "label": "Population_Density"
    //     },
    //     {
    //         "value": "Education amenities_density",
    //         "label": "Education amenities_density"
    //     },
    //     {
    //         "value": "Entertainment amenities_density",
    //         "label": "Entertainment amenities_density"
    //     },
    //     {
    //         "value": "Food amenities_density",
    //         "label": "Food amenities_density"
    //     },
    //     {
    //         "value": "Leisure amenities_density",
    //         "label": "Leisure amenities_density"
    //     },
    //     {
    //         "value": "Shopping amenities_density",
    //         "label": "Shopping amenities_density"
    //     },
    //     {
    //         "value": "bins_density",
    //         "label": "bins_density"
    //     }
    // ]

   
    
      

    return (

        <div className="flex w-full gap-4 mt-4">

            <div className="w-1/5 p-4">
                
                <div className="flex flex-col gap-4">


                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                        {loadingExternalData ? (
              <div>Loading states...</div>
            ) : (
                        <Select
                            id="state"
                            value={filters.state}
                            onChange={(selectedOption) => handleFilterChange('state', selectedOption)}
                            options={statesData}
                            placeholder="Select a State"
                        />
                    )}
                    </div>

                    

                    <div className="mt-4 flex gap-4">
                        <Button className="w-full bg-[#3AAD73] text-white hover:bg-[#33a060]" disabled={loadingAnalysisData || loadingAnalysisData} onClick={handleApply}>
                            Apply
                        </Button>
                        <Button className="w-full bg-[#FF4D4D] text-white hover:bg-[#e34e4e]"  disabled={filters.state === null && filters.parameter === null} onClick={handleClear}>
                            Clear
                        </Button>
                        {/* <Button 
    className="w-full bg-[#FF4D4D] text-white hover:bg-[#e34e4e]" 
    onClick={() => setShowGeoJSON(prev => !prev)}
  >
    {showGeoJSON ? "Hide GeoJSON" : "Show GeoJSON"}
  </Button> */}
                    </div>
                    {/* <div>
                        <label htmlFor="parameterName" className="block text-sm font-medium text-gray-700">Parameter Name</label>
                        {loadingExternalData ? (
              <div>Loading coefficients...</div>
            ) : (
                        <Select
                            id="parameterName"
                            value={correlationCoeff}
                            onChange={(selectedOption) => setCorrelationCoeff(selectedOption)}
                            options={dropDown}
                            placeholder="Select coefficient"
                        />
                        )}
                    </div> */}
                </div>
            </div>


            
            <div className="w-3/5 p-4 flex flex-col justify-start items-center gap-4">

                {/* AnalysisMap section */}
                <div className="w-full h-96 p-4 bg-gray-200 rounded">
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

                <div>
                        <label htmlFor="parameterName" className="block text-sm font-medium text-gray-700">Parameter Name</label>
                        {loadingExternalData ? (
              <div>Loading coefficients...</div>
            ) : (
                        <Select
                            id="parameterName"
                            value={correlationCoeff}
                            onChange={(selectedOption) => setCorrelationCoeff(selectedOption)}
                            options={dropDown}
                            placeholder="Select coefficient"
                        />
                        )}
                    </div>
                <div className="w-full flex gap-4">
                
                    <div className="w-1/2 p-4 bg-gray-200 rounded">
                        
                        <h3 className="text-xl font-semibold mb-2 text-center">Correlation Coefficient</h3>
                        <Scatter options={options} data={dataForScatter} />
                    </div>
                    <div className="w-1/2 p-4 bg-gray-200 rounded">
                       
                        <h3 className="text-xl font-semibold mb-2 text-center">Litter Types</h3>
                        {loadingAnalysisData ? (
              <div>Loading doughnut chart...</div>
            ) : (
                        <Doughnut data={data} />
            )}
                    </div>
                </div>

            </div>

            {/* New Sections in the Right Sidebar */}
            <div className="w-1/5 p-4 space-y-6">

                {/* Total Cleanup Section */}
                <div className="p-4 bg-gray-200 rounded">
                    <h3 className="text-xl font-semibold">Total Estimated Litter</h3>
                    {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
                    <span className="block text-lg font-bold">{analysisData?.total_estimated_litter?.toFixed(2)}</span>
            )}
                    </div>


                <div className="p-4 bg-gray-200 rounded">
                    <h3 className="text-xl font-semibold">Estimated Litter Density</h3>
                    {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
                    <span className="block text-lg font-bold">{analysisData?.estimated_litter_density?.toFixed(2)}</span>
            )}
                    </div>


                {/* Top 3 States Section */}
                <div className="p-4 bg-gray-200 rounded">
                    <h3 className="text-xl font-semibold">Top 3 States</h3>
                    {/* {topStates.map((state, index) => (
                        <div key={index} className="p-4 bg-white border rounded-lg shadow-md mb-4">
                            <h4 className="text-lg font-medium">{state.name}</h4>
                            <p className="text-sm text-gray-500">{state.placeholder}</p>
                            <p className="text-sm text-gray-500">{state.placeholder}</p>
                        </div>
                    ))} */}
                    {loadingAnalysisData ? (
            <div>Loading top states...</div>
          ) : (<>
                    {analysisData?.top_3_states?.map((state:any, index:any) => (
        <div key={index} className="p-4 bg-white border rounded-lg shadow-md mb-4">
          <h4 className="text-lg font-medium">{state.State}</h4>
          <p className="text-sm text-gray-500">Estimated: {state.Estimated.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Litter Density: {state["Litter density"].toFixed(2)}</p>
        </div>
      ))}
      </>
    )}
                </div>

            </div>

        </div>


    );
}

export default AnalysisKAB;
