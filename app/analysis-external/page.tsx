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
//import Select from 'react-select';
import { Button } from "@/components/ui/button";
import { applyFilter, getAnalysisExternalData } from "../utils/api";
const AnalysisMap = dynamic(() => import("../../src/components/AnalysisMap"), { ssr: false });
const Select = dynamic(() => import('react-select'), { ssr: false });
import value from "../../public/analysisdata.json"

interface FilterOption {
  value: string | null;  // Assuming values are strings or null if not selected
  label: string;
}

// Define the type for the filters state
interface Filters {
  state: FilterOption | null;
  county: FilterOption | null;
  tract: FilterOption | null;
  year: FilterOption | null;
}

interface MarkerData {
  latitude: number;       // Latitude of the marker
  longitude: number;      // Longitude of the marker
  litter_quantity: number; // Amount of litter at the marker
  cleanup_year: number;   // Year of the cleanup event
}


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale,
  BarElement,
  Title);

const Analysis = () => {

  const [filters, setFilters] = useState<Filters>({
    state: null,
    county: null,
    tract: null,
    year: null,
  });
  //value?.map_data
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [zoom, setZoom] = useState<number>(4);
  const [center, setCenter] = useState<[number, number]>([37.0902, -95.7129]);

  const [statesData, setStatesData] = useState<any[]>([]); 
  const [countiesData, setCountiesData] = useState<any[]>([]); 
  const [tractsData, setTractsData] = useState<any[]>([]); 
  const [yearsData, setYearsData] = useState<any[]>([]); 
  const [analysisData, setAnalysisData] = useState<any>({});
  const [loadingAnalysisData, setLoadingAnalysisData] = useState<boolean>(false); // Loading state for applyFilter
  const [loadingExternalData, setLoadingExternalData] = useState<boolean>(false); // Loading state for getAnalysisExternalData
  const [error, setError] = useState<string | null>(null); // Track error state

  useEffect(() => {
    const fetchData = async () => {
      setLoadingExternalData(true);
      setLoadingAnalysisData(true); 
      setError(null); 
  
      try {
        
        const data = await getAnalysisExternalData();
        setStatesData(data.States); 
        setCountiesData(data.Counties); 
        setTractsData(data.TractIDs); 
        setYearsData(data.Years);
  
        setLoadingExternalData(false); 
  
        
        const value = await applyFilter();
        setAnalysisData(value);
  
        setLoadingAnalysisData(false); 
      } catch (error) {
        setError("Failed to fetch data, please try again later.");
        console.error("Error fetching data:", error);
        setLoadingAnalysisData(false);
        setLoadingExternalData(false);
      } finally {
       
      }
    };
  
    fetchData();
  }, []); 


  const handleFilterChange = (filter: string, selectedOption: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filter]: selectedOption,
    }));
    //setZoom
    //setCenter
    //setMarkers
  };

  const handleApply = async () => {
    
    const queryParams = {
      state: filters.state?.value || null,
      county: filters.county?.value || null,
      tract: filters.tract?.value || null,
      year: filters.year?.value || null,
    };

    // Filter out undefined values
const cleanedQueryParams = Object.fromEntries(
  Object.entries(queryParams).filter(([_, v]) => v !== undefined)
);

    console.log("payload",queryParams)
    setLoadingAnalysisData(true);
    try {
      const res = await applyFilter(queryParams);
      console.log("res",res)
      setAnalysisData(res);
      setMarkers(res?.map_data)
      setLoadingAnalysisData(false); 
    } catch (error) {
      console.error("Error:", error);
      setLoadingAnalysisData(false); 
    }
  };

  const handleClear = () => {
    setFilters({
      state: null,
      county: null,
      tract: null,
      year: null,
    });
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
          'rgba(255, 99, 132, 0.2)',   // light pink
          'rgba(54, 162, 235, 0.2)',   // light blue
          'rgba(255, 159, 64, 0.2)',   // light orange
          'rgba(75, 192, 192, 0.2)',   // light teal
          'rgba(153, 102, 255, 0.2)',  // light purple
          'rgba(255, 205, 86, 0.2)',   // light yellow
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',    // pink
          'rgba(54, 162, 235, 1)',    // blue
          'rgba(255, 159, 64, 1)',    // orange
          'rgba(75, 192, 192, 1)',    // teal
          'rgba(153, 102, 255, 1)',   // purple
          'rgba(255, 205, 86, 1)',    // yellow
        ],
        borderWidth: 1,
      },
    ],
  };
console.log("analysisData",analysisData)
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

  
  return (

    <div className="flex w-full gap-4 mt-4">

      <div className="w-1/5 p-4">
        {/* Filters section with 4 select dropdowns */}
        <div className="flex flex-col gap-4">


          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
            {loadingExternalData ? (
              <div>Loading states...</div> // Show loading state if fetching states data
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


          <div>
            <label htmlFor="county" className="block text-sm font-medium text-gray-700">County</label>
            {loadingExternalData ? (
              <div>Loading counties...</div> // Show loading state if fetching counties data
            ) : (
              <Select
                id="county"
                value={filters.county}
                onChange={(selectedOption) => handleFilterChange('county', selectedOption)}
                options={countiesData}
                placeholder="Select a County"
              />
            )}
          </div>


          <div>
            <label htmlFor="tract" className="block text-sm font-medium text-gray-700">Tract ID</label>
            {loadingExternalData ? (
              <div>Loading tracts...</div> // Show loading state if fetching tracts data
            ) : (
              <Select
                id="tract"
                value={filters.tract}
                onChange={(selectedOption) => handleFilterChange('tract', selectedOption)}
                options={tractsData}
                placeholder="Select a Tract ID"
              />
            )}
          </div>


          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
            {loadingExternalData ? (
              <div>Loading years...</div> // Show loading state if fetching years data
            ) : (
              <Select
                id="year"
                value={filters.year}
                onChange={(selectedOption) => handleFilterChange('year', selectedOption)}
                options={yearsData}
                placeholder="Select a Year"
              />
            )}
          </div>


          <div className="mt-4 flex gap-4">
            <Button className="w-full bg-[#3AAD73] text-white hover:bg-[#33a060]" onClick={handleApply}>
              Apply
            </Button>
            <Button className="w-full bg-[#FF4D4D] text-white hover:bg-[#e34e4e]" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </div>


      {/* Center section with the AnalysisMap and two subsections below */}
      <div className="w-3/5 p-4 flex flex-col justify-start items-center gap-4">

        {/* AnalysisMap section */}
        <div className="w-full h-96 p-4 bg-gray-200 rounded">
          <AnalysisMap markers={markers.slice(0, 100)} zoom={zoom} center={center} />
        </div>

        <div className="w-full flex gap-4">
          <div className="w-1/2 p-4 bg-gray-200 rounded">
            {/* Explanation text for Bar chart */}
            <h3 className="text-xl font-semibold mb-2 text-center">No of Cleanups by Year</h3>
            {loadingAnalysisData ? (
              <div>Loading bar chart...</div> // Show loading while fetching bar chart data
            ) : (
              <Bar options={options} data={dataForBar} />
            )}
          </div>
          <div className="w-1/2 p-4 bg-gray-200 rounded">
            {/* Explanation text for Doughnut chart */}
            <h3 className="text-xl font-semibold mb-2 text-center">Litter Types</h3>
            {loadingAnalysisData ? (
              <div>Loading doughnut chart...</div> // Show loading while fetching doughnut chart data
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
          <h3 className="text-xl font-semibold">Total Cleanup</h3>
          <span className="block text-lg font-bold">{analysisData?.analytics?.total_cleanups}</span>
          <p className="text-sm text-gray-600">Sum of the number of cleanup actions.</p>
        </div>

        {/* Top 3 States Section */}
        <div className="p-4 bg-gray-200 rounded">
          <h3 className="text-xl font-semibold">Top 3 States</h3>
          {loadingAnalysisData ? (
            <div>Loading top states...</div> // Show loading while fetching top states data
          ) : (
            Object.entries(analysisData?.analytics?.top_3_states || {}).map(([key, value]) => (
              <div key={key} className="p-4 bg-white border rounded-lg shadow-md mb-4">
                <h4 className="text-lg font-medium">{key}</h4>
                <p className="text-sm text-gray-500">{value as React.ReactNode}</p>
              </div>
            ))
          )}
        </div>

        {/* Top 3 Counties Section */}
        <div className="p-4 bg-gray-200 rounded">
          <h3 className="text-xl font-semibold">Top 3 Counties</h3>
          {loadingAnalysisData ? (
            <div>Loading top counties...</div> // Show loading while fetching top counties data
          ) : (
            Object.entries(analysisData?.analytics?.top_3_counties || {}).map(([key, value]) => (
              <div key={key} className="p-4 bg-white border rounded-lg shadow-md mb-4">
                <h4 className="text-lg font-medium">{key}</h4>
                <p className="text-sm text-gray-500">{value as React.ReactNode}</p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>


  );
}

export default Analysis;
