'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { analysisNewDropdown, applyFilter, getAnalysisExternalData, getPredictionDashboard, predictionNewDropdown } from "../utils/api";
import Switch from "react-switch";
import WeekSelector from "@/src/components/WeekSelector";
import { useSession } from "next-auth/react";
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
}

interface MarkerData {
  latitude: number;
  longitude: number;
  litter_quantity: number;
  cleanup_date: string;
}

interface SwitchState {
  bins: boolean;
  socioEconomic: boolean;
  weatherOutlook: boolean;
  typeOfArea: boolean;
  amenities:boolean
}

// Define the props for the SwitchItem component
interface SwitchItemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  BarElement,
  Title);

const Prediction = () => {

  const [filters, setFilters] = useState<Filters>({
    state: null,
    county: null,
    tract: null,
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
    socioEconomic: false,
    weatherOutlook: false,
    typeOfArea: false,
    amenities:false
  });
  const [loadingAnalysisNewData, setLoadingAnalysisNewData] = useState<boolean>(false);
  const [weeks,setWeeks] = useState([])


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

  useEffect(() => {
    const fetchData = async () => {
      setLoadingExternalData(true);
      setLoadingAnalysisData(true);
      setLoadingAnalysisNewData(true);
      setError(null);

      try {

        const dropD = await predictionNewDropdown();
        setStatesData(dropD?.Dropdown)
        setWeeks(dropD?.Weeks)
        setLoadingAnalysisNewData(false)
        setLoadingExternalData(false);
        setLoadingAnalysisData(false);
        const dataDashboard = await getPredictionDashboard();
        setPredictionData(dataDashboard);
        // const value = await applyFilter();
        // setAnalysisData(value);
        // //setMarkers(value?.map_data)
        // setLoadingAnalysisData(false);
      } catch (error) {
        setError("Failed to fetch data, please try again later.");

        setLoadingAnalysisData(false);
        setLoadingExternalData(false);
        setLoadingAnalysisNewData(false)
      } finally {

      }
    };

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
      state: filters.state?.value || null,
      county: filters.county?.value || null,
      tract: filters.tract?.value || null,
    };

    // Filter out undefined values
    const cleanedQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v !== undefined)
    );

    setLoadingAnalysisData(true);
    setLoadingMapData(true);
    try {
      const res = await predictionNewDropdown(queryParams);
      setPredictionData(res);
      //setMarkers(res?.map_data)
      setLoadingAnalysisData(false);
      setLoadingMapData(false);
      //setZoom()
      //setCenter()
    } catch (error) {
      setLoadingAnalysisData(false);
      setLoadingMapData(false);
    }
  };

  const handleClear = () => {
    setFilters({
      state: null,
      county: null,
      tract: null,
    });
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

  const SwitchItem: React.FC<SwitchItemProps> = ({ label, checked, onChange }) => (
    <div className="flex items-center space-x-2">
      <Switch onChange={onChange} checked={checked} uncheckedIcon={false} 
        checkedIcon={false} onColor="#5BAA76"  height={20} width={40} handleDiameter={14} />  
      <span>{label}</span>
    </div>
  );

  
  if (status === "loading") {
    return <p>Loading...</p>; // Prevents UI flickering
}

  return (

    <div className="flex w-full gap-4 mt-4 px-4 bg-[rgba(91,170,118,0.1)]">


<div className="w-1/5 p-4 mt-4 mb-4 bg-white rounded-lg shadow-md">



        <div className="flex flex-col gap-4">
        <h1 className="font-bold">Map Controllers</h1>

          <div>
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


          <div>
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


          <div>
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


         



    <div className="mt-4 flex flex-col gap-4">
            <Button className="w-full bg-[#5BAA76] text-white hover:bg-[#5BAA76]" disabled={loadingAnalysisNewData || loadingAnalysisData}  onClick={handleApply}>
              Apply
            </Button>
           <Button className="w-full bg-transparent text-black font-bold border border-[#5BAA76] rounded-md hover:bg-[#ffffff] hover:text-black transition" disabled={!isClearButtonEnabled} onClick={handleClear}>
  Clear
</Button>

          </div>
          <div className="space-y-4">
  <SwitchItem label="Bins" checked={switches.bins} onChange={handleChange("bins")} />
  <SwitchItem label="Amenities" checked={switches.socioEconomic} onChange={handleChange("amenities")} />
  {/* <SwitchItem label="Weather Outlook" checked={switches.weatherOutlook} onChange={handleChange("weatherOutlook")} />
  <SwitchItem label="Type of Area" checked={switches.typeOfArea} onChange={handleChange("typeOfArea")} /> */}
</div>
        </div>
      </div>



      <div className="w-3/5 p-4 flex flex-col justify-start items-center gap-4 mt-[-1.5%]">
        
      <div>
            <p className="mt-4 text-black text-base font-semibold font-neris">Select a week</p>
    {loadingAnalysisData ? <>Loading...</> :
      <WeekSelector weeks={weeks} />}
      </div> 

      <div className="w-full h-96  " style={{marginTop:'3%'}}>
             {loadingMapData ? (
            <div className="flex justify-center items-center h-full p-1">
              <span className="text-xl text-gray-400">Loading map...</span>
            </div>
          ) : (
            <MapPrediction markers={markers.slice(0, 100)} zoom={zoom} center={center} switches={switches}/>
          )}
        </div>

 

      
     </div>


      <div className="w-1/5 p-4 mt-4 space-y-6 mb-4 bg-white rounded-lg shadow-md">




      <div className="p-4 bg-[#DCFCE7] rounded">
                    <p className="mt-4 text-black text-base font-semibold font-neris">Total Estimated Litter:</p>
                    {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
                    <span className="block text-xl font-bold text-green-700">{predictionData?.Total_Estimated_Litter?.toFixed(2)}</span>
            )}
                    </div>


                <div className="p-4 bg-[#DCFCE7] rounded">
                <p className="mt-4 text-black text-base font-semibold font-neris whitespace-nowrap">
    Estimated Litter Density:
</p>

                    {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
                    <span className="block text-xl font-bold text-green-700">{predictionData?.Estimated_Litter_Density?.toFixed(2)}</span>
            )}
                    </div>

                    <div className="h-auto">
                    {/* <Bar options={options} data={data} /> */}
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


  );
}

export default Prediction;
