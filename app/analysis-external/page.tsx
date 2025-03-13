'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  ChartOptions,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { analysisNewDropdown, applyFilter, getAnalysis, getAnalysisDashboard, getAnalysisDashboardMap, getAnalysisExternalData } from "../utils/api";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatNumber } from "@/utils/common";

const AnalysisMap = dynamic(() => import("../../src/components/AnalysisMap"), { ssr: false });
const Select = dynamic(() => import('react-select'), { ssr: false });

interface FilterOption {
  value: string | null;
  label: string;
}

interface Filters {
  state: FilterOption | null;
  county: FilterOption | null;
  tract: FilterOption | null;
  year: FilterOption | null;
}

interface MarkerData {
  latitude: number;
  longitude: number;
  litter_quantity: number;
  cleanup_date: string;
  radius:number
}


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ChartDataLabels,
  Title);

const Analysis = () => {

  const [filters, setFilters] = useState<Filters>({
    state: null,
    county: null,
    tract: null,
    year: null,
  });
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [zoom, setZoom] = useState<number>(4);
  const [center, setCenter] = useState<[number, number]>([37.0902, -95.7129]);

  const [statesData, setStatesData] = useState<any[]>([]);
  const [countiesData, setCountiesData] = useState<any[]>([]);
  const [tractsData, setTractsData] = useState<any[]>([]);
  const [yearsData, setYearsData] = useState<any[]>([]);
  const [analysisData, setAnalysisData] = useState<any>({});
  const [loadingAnalysisData, setLoadingAnalysisData] = useState<boolean>(false);
  const [loadingExternalData, setLoadingExternalData] = useState<boolean>(false);
  const [loadingMapData, setLoadingMapData] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null);
  const [statesNewData,setStatesNewData] = useState<any>([]);
  const [loadingAnalysisNewData, setLoadingAnalysisNewData] = useState<boolean>(false);
  const [countiesNewData, setCountiesNewData] = useState<any[]>([]);
  const [tractsNewData, setTractsNewData] = useState<any[]>([]);
  const [yearsNewData, setYearsNewData] = useState<any[]>([]);


  const fetchData = async () => {
    setLoadingExternalData(true);
    setLoadingAnalysisData(true);
    setLoadingAnalysisNewData(true);
    setError(null);

    try {

      // const data = await getAnalysisExternalData();
      // setStatesData(data.States);
      // setCountiesData(data.Counties);
      // setTractsData(data.TractIDs);
      // setYearsData(data.Years);

      setLoadingExternalData(false);
      const dropD = await analysisNewDropdown();
      setStatesNewData(dropD?.Dropdown)
      setYearsNewData(dropD?.Years)
      setLoadingAnalysisNewData(false)

      // const value = await applyFilter();
      // setAnalysisData(value);
      const test = await getAnalysis();
      setAnalysisData(test);
      //setMarkers(value?.map_data)
      
      setLoadingAnalysisData(false);
    } catch (error) {
      setError("Failed to fetch data, please try again later.");

      setLoadingAnalysisData(false);
      setLoadingAnalysisNewData(false)
      setLoadingExternalData(false);
    } finally {

    }
  };
  useEffect(() => {
    

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

  const handleApply = async () => {

    const queryParams = {
      state: filters.state?.value || null,
      county: filters.county?.value || null,
      tractid: filters.tract?.value || null,
      year: filters.year?.value || null,
    };

    const queryParamsForMap = {
      state: filters.state?.value || null,
      zone: filters.county?.value || null,
      tractid: filters.tract?.value || null,
      year: filters.year?.value || null,
    };

    // Filter out undefined values
    const cleanedQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v !== undefined)
    );

    setLoadingAnalysisData(true);
    setLoadingMapData(true);
    try {
      // const res = await applyFilter(queryParams);
      // setAnalysisData(res);
      // setMarkers(res?.map_data)
      const res = await getAnalysisDashboard(queryParams);
      
      setAnalysisData(res);
      setCenter(res?.centroid)
      setLoadingAnalysisData(false);
      
      const resp = await getAnalysisDashboardMap(queryParamsForMap);
      setMarkers(resp?.map_data)

      if (queryParams.state && !queryParams.county && !queryParams.tractid) {
        // If state is present and county and tract are null
        setZoom(5);
      } else if (queryParams.state && queryParams.county && !queryParams.tractid) {
        // If state and county are present and tract is null
        setZoom(6);
      } else if (queryParams.state && queryParams.county && queryParams.tractid) {
        // If state, county, and tract are all present
        setZoom(7);
      }
      
      setLoadingMapData(false);
  
      
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
      year: null,
    });
    fetchData();
    setCenter([37.0902, -95.7129])
    setZoom(4)
    
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      // title: {
      //   display: true,
      //   text: '',
      // },
    },
  };

  const data = {
    labels: Object.keys(analysisData?.analytics?.pie_chart || {}),
    datasets: [
      {
        label: '# of Litter',
        data: Object.values(analysisData?.analytics?.pie_chart || {}),
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

  const labels = Object.keys(analysisData?.analytics?.trend_chart || {});

  const dataForBar = {
    labels,
    datasets: [
      {
        label: 'Years',
        data: Object.values(analysisData?.analytics?.trend_chart || {}),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const optionsLine = {
    responsive: true,
    plugins: {
      legend: {
        
        display: false, // Hides the legend completely
      
      },
      datalabels: {
        display: false, // 🔥 This will remove the numbers on the line
      },
   /*    title: {
        display: true,
        text: 'Line Chart',
      }, */
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Number of Cleanups by Year', 
        },
      },
    },
  };
  


  const labelsLine = Object.keys(analysisData?.analytics?.trend_chart || {});

  const dataLine = {
    labels:labelsLine,
    datasets: [
      {
        label: '',
        data: Object.values(analysisData?.analytics?.trend_chart || {}),
        borderColor: '#5BAA76',
        pointBackgroundColor: '#5BAA76', 
     
        
      },
    ],
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
      
      const dropD = await analysisNewDropdown(queryParams);
      if(val=="state"){
        
        setCountiesNewData(dropD?.Dropdown)
        setLoadingAnalysisNewData(false)
      }
      else if (val=="county"){
        setTractsNewData(dropD?.Dropdown)
        setLoadingAnalysisNewData(false)
      }
    }
    catch(error){
      alert("error")
      setLoadingAnalysisNewData(false)
    }
  }

  const isClearButtonEnabled = Object.values(filters).some((value) => value !== null);
  const optionsDoughnut: ChartOptions<'doughnut'> = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: '40%', // Keeps a thinner doughnut
    layout: {
      padding: 15, // Adds some spacing around
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          boxWidth: 14,
          padding: 12,
        },
      },
      datalabels: {
        formatter: (value, context) => {
          const dataset = context.chart.data.datasets[0].data as number[];
          const total = dataset.reduce((acc, val) => acc + val, 0);
          return `${((value as number / total) * 100).toFixed(0)}%`;
        },
        color: '#000',
        font: {
          weight: 'normal',
          size: 10,
        },
        align: 'end', // Keeps labels outside
        anchor: 'end',
        offset: 0, // Pulls labels closer to the pie chart
        clip: false, // Prevents labels from being cut off
      },
    },
  };
  

  return (
<div className="flex w-full gap-4 mt-4 bg-[rgba(91,170,118,0.1)] p-4 min-h-screen">




<div className="w-1/5 p-4 bg-white shadow-md rounded-lg mt-10">


        <div className="flex flex-col gap-4">

  

          <div>
            <label htmlFor="state" className="block text-base font-semibold text-black-600 mb-2 font-neris">State:</label>
            {loadingAnalysisNewData ? (
              <div>Loading states...</div>
            ) : (
              <Select
              id="state"
              value={filters.state}
              placeholder="Select a State"
              onChange={(selectedOption) => {
                handleFilterChange('state', selectedOption)
              handleDropdownFurther('state',selectedOption)
              }}
              options={statesNewData}
              styles={{
                control: (base, state) => ({
                  ...base,
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
                    ? "#5BAA76" // ✅ Selected item stays green
                    : isFocused
                    ? "#A5D6A7" // ✅ Light green on hover
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


          <div>
            <label htmlFor="county" className="block text-base font-semibold text-black-600 mb-2 font-neris">County</label>
            {loadingAnalysisNewData ? (
              <div>Loading counties...</div>
            ) : (
              <Select
                id="county"
                value={filters.county}
                onChange={(selectedOption) => {
                  handleFilterChange('county', selectedOption)
                  handleDropdownFurther('county',selectedOption)
                }}
                options={countiesNewData}
isDisabled={!filters?.state?.value}
                placeholder="Select a County"
                styles={{
                  control: (base, state) => ({
                    ...base,
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
                      ? "#5BAA76" // ✅ Selected stays green
                      : isFocused
                      ? "#A5D6A7" // ✅ Light green on hover
                      : "white",
                    color: isSelected ? "white" : "black",
                    "&:hover": {
                      backgroundColor: "#5BAA76",
                      color: "white",
                    },
                    "&:active": {
                      backgroundColor: "#5BAA76", // ✅ Prevents blue flash when dragging
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "black",
                    fontWeight: "semibold",
                  }),
                }}
              />
            )}
          </div>


          <div>
            <label htmlFor="tract" className="block text-base font-semibold text-black-600 mb-2 font-neris">Tract</label>
            {loadingAnalysisNewData ? (
              <div>Loading tracts...</div>
            ) : (
              <Select
                id="tract"
                value={filters.tract}
                onChange={(selectedOption) => handleFilterChange('tract', selectedOption)}
                options={tractsNewData}
isDisabled={!filters?.county?.value}
                placeholder="Select a Tract ID"
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
                    fontSize: "14px",
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
            <label htmlFor="year" className="block text-base font-semibold text-black-600 mb-2 font-neris">Year</label>
            {loadingAnalysisNewData ? (
              <div>Loading years...</div>
            ) : (
              <Select
                id="year"
                value={filters.year}
                onChange={(selectedOption) => handleFilterChange('year', selectedOption)}
                options={yearsNewData}
                placeholder="Select a Year"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                    boxShadow:
                      state.isFocused || state.hasValue
                        ? "0px 2px 4px rgba(91, 170, 118, 0.3)" // ✅ Always show shadow if selected
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
                    color: "#000000", // ✅ Selected value should be black
                    fontWeight: "semibold", // ✅ Selected value should be semi-bold
                  }),
                }}
              />
            )}
          </div>


          <div className="mt-4 flex flex-col gap-4">
            <Button className="w-full bg-[#3AAD73] text-white hover:bg-[#33a060]" disabled={loadingAnalysisNewData || loadingAnalysisData} onClick={handleApply}>
              Apply
            </Button>
           <Button className="w-full bg-transparent text-black font-bold border border-[#5BAA76] rounded-md hover:bg-[#ffffff] hover:text-black transition" disabled={!isClearButtonEnabled} onClick={handleClear}>
  Clear
</Button>

          </div>
        </div>
      </div>



      <div className="w-3/5 p-4 flex flex-col justify-start items-center gap-4">

  
      <div className="w-full h-96 p-4 rounded mb-[40px]">

        <p className="block text-base font-semibold text-black-600 mb-2 font-neris" style={{ marginLeft: "-19px" }}>Litter Cleanup Activity Map:</p>
          {loadingMapData ? (
       <div className="flex justify-center items-center h-full mt-4">

              <span className="text-xl text-gray-600">Loading map...</span>
            </div>
          ) : (
            <AnalysisMap markers={markers?.slice(0,2000)} zoom={zoom} center={center} />
          )}
        </div>
  
        <div className="w-full flex flex-wrap justify-center gap-4 mt-20">
        <div className="flex justify-between w-full gap-5">
  {/* Left Title */}
  <div className="w-1/2">
    <p className="text-base font-semibold font-neris">Trend of Cleanup Programs Over Years</p>
  </div>

  {/* Right Title */}
  <div className="w-1/2">
 <p className="text-base font-semibold font-neris ">Break Down of Litter Types</p>

</div>
</div>


<div className="flex-1 min-w-[300px] h-[300px] p-4 bg-white rounded flex flex-col items-center">
  {loadingAnalysisData ? (
    <div>Loading line chart...</div>
  ) : (
    <Line options={optionsLine} data={dataLine} height={400} /> 
  )}
</div>


<div className="flex-1 min-w-[300px] h-[300px] p-4 bg-white rounded flex flex-col items-center relative">
  {loadingAnalysisData ? (
    <div>Loading doughnut chart...</div>
  ) : (
    <Doughnut 
      data={data} 
      options={optionsDoughnut}
    />
  )}

  {/* Text Outside the White Box (Aligned to Bottom-Right) */}
  <div className="absolute bottom-[-20px] right-2 text-xs text-gray-500">
  Source: Cleanswell App
  </div>
</div>

</div>

</div>






      <div className="w-1/5 p-4  bg-white rounded-lg shadow-lg min-w-[250px] mt-10">

{/* year part */}

<div className="flex flex-col p-2 rounded-lg bg-white shadow-[0px_4px_6px_-2px_rgba(91,170,118,0.2)]">
  {/* Year */}
 {/*  <div className="flex items-center gap-2 mt-[-10px]">
    <span className="text-blue-500 text-lg">📅</span> 
    <span className="text-sm font-medium text-gray-500">2022</span>
  </div> */}

  {/* Title */}
  <p className="mt-4 text-black text-base font-semibold font-neris">
    Total Number of Cleanup Programs:
  </p>

  {/* Value */}
  <div className="flex items-center gap-1 mt-3">
  <img src="/Brush.svg" alt="Broom Icon" className="w-9 h-9" />

  {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
              <span className="text-xl font-bold text-green-700">
              {formatNumber(analysisData?.analytics?.total_cleanups)}
            </span>
            )}
    
  </div>
</div>

{/* top 3 states */}

<div className="p-2 rounded mt-5 font-neris">
  <p className="text-base font-semibold font-neris">
    Top 3 States by Number of Cleanup Programs:
  </p>
  {loadingAnalysisData ? (
    <div>Loading top states...</div>
  ) : (
    Object.entries(analysisData?.analytics?.top_3_states || {}).map(([key, value]) => (
      <div key={key} className="flex items-center gap-2 p-2 rounded-lg mb-2">
        {/* Adjusted Indicator */}
        <span className="w-1.5 h-1.5 bg-[#5BAA76] rounded-full relative -top-[8px]"></span>
        
        {/* Text */}
        <div>
          <p className="text-base font-medium font-neris">{key}</p>
          <p className="text-xs text-gray-500 font-neris">{formatNumber(Number(value))}</p> {/* Reduced font size */}
        </div>
      </div>
    ))
  )}
</div>





<div className="p-1 rounded mt-5 font-neris">
  <p className="text-base font-semibold font-neris">
    Top 3 Counties by Number of Cleanup Programs:
  </p>
  {loadingAnalysisData ? (
    <div>Loading top counties...</div>
  ) : (
    Object.entries(analysisData?.analytics?.top_3_counties || {}).map(([key, value]) => (
      <div key={key} className="flex items-center gap-2 p-2 rounded-lg mb-2">
        {/* Green Indicator */}
        <span className="w-1.5 h-1.5 bg-[#5BAA76] rounded-full relative -top-[8px]"></span>

        {/* Text Content */}
        <div>
          <h4 className="text-base font-medium font-neris">{key}</h4>
          <p className="text-sm text-gray-500 font-neris">{formatNumber(Number(value))}</p>
        </div>
      </div>
    ))
  )}
</div>


      </div>

    </div>


  );
}

export default Analysis;
