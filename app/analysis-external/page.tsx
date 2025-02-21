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
  position: [number, number]; // Coordinates
  label: string; // Label for the marker
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

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [zoom, setZoom] = useState<number>(4);
  const [center, setCenter] = useState<[number, number]>([37.0902, -95.7129]);

  useEffect(()=>{
    getAnalysisExternalData()
  },[])

  const handleFilterChange = (filter: string, selectedOption: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filter]: selectedOption,
    }));
  };

  const handleApply = async () => {
    // Create the payload from the filters state
    const payload = {
      state: filters.state?.value || null,
      county: filters.county?.value || null,
      tract: filters.tract?.value || null,
      year: filters.year?.value || null,
    };

    console.log("payload",payload)

    try {
      const res = applyFilter(payload);
    } catch (error) {
      console.error("Error:", error);
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
      title: {
        display: true,
        text: 'Chart.js Bar Chart',
      },
    },
  };

  const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
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

  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

  const dataForBar = {
    labels,
    datasets: [
      {
        label: 'Dataset 1',
        data: [800, 700, 600, 500, 400, 300, 200],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const topStates = [
    { name: "State 1", placeholder: "State 1 Info" },
    { name: "State 2", placeholder: "State 2 Info" },
    { name: "State 3", placeholder: "State 3 Info" },
  ];

  const topCounties = [
    { name: "County 1", placeholder: "County 1 Info" },
    { name: "County 2", placeholder: "County 2 Info" },
    { name: "County 3", placeholder: "County 3 Info" },
  ];


  return (

    <div className="flex w-full gap-4 mt-4">

      <div className="w-1/5 p-4">
        {/* Filters section with 4 select dropdowns */}
        <div className="flex flex-col gap-4">


          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
            <Select
              id="state"
              value={filters.state}
              onChange={(selectedOption) => handleFilterChange('state', selectedOption)}
              options={[
                { value: 'state1', label: 'State 1' },
                { value: 'state2', label: 'State 2' },
                // Add more state options
              ]}
              placeholder="Select a State"
            />
          </div>


          <div>
            <label htmlFor="county" className="block text-sm font-medium text-gray-700">County</label>
            <Select
              id="county"
              value={filters.county}
              onChange={(selectedOption) => handleFilterChange('county', selectedOption)}
              options={[
                { value: 'county1', label: 'County 1' },
                { value: 'county2', label: 'County 2' },
                // Add more county options
              ]}
              placeholder="Select a County"
            />
          </div>


          <div>
            <label htmlFor="tract" className="block text-sm font-medium text-gray-700">Tract ID</label>
            <Select
              id="tract"
              value={filters.tract}
              onChange={(selectedOption) => handleFilterChange('tract', selectedOption)}
              options={[
                { value: 'tract1', label: 'Tract 1' },
                { value: 'tract2', label: 'Tract 2' },
                // Add more tract options
              ]}
              placeholder="Select a Tract ID"
            />
          </div>


          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
            <Select
              id="year"
              value={filters.year}
              onChange={(selectedOption) => handleFilterChange('year', selectedOption)}
              options={[
                { value: '2020', label: '2020' },
                { value: '2021', label: '2021' },
                { value: '2022', label: '2022' },
                // Add more year options
              ]}
              placeholder="Select a Year"
            />
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
          <AnalysisMap markers={markers} zoom={zoom} center={center} />
        </div>

        <div className="w-full flex gap-4">
          <div className="w-1/2 p-4 bg-gray-200 rounded">
            {/* Explanation text for Bar chart */}
            <h3 className="text-xl font-semibold mb-2 text-center">No of Cleanups by Year</h3>
            <Bar options={options} data={dataForBar} />
          </div>
          <div className="w-1/2 p-4 bg-gray-200 rounded">
            {/* Explanation text for Doughnut chart */}
            <h3 className="text-xl font-semibold mb-2 text-center">Litter Types</h3>
            <Doughnut data={data} />
          </div>
        </div>

      </div>

      {/* New Sections in the Right Sidebar */}
      <div className="w-1/5 p-4 space-y-6">

        {/* Total Cleanup Section */}
        <div className="p-4 bg-gray-200 rounded">
          <h3 className="text-xl font-semibold">Total Cleanup</h3>
          <span className="block text-lg font-bold">8768</span>
          <p className="text-sm text-gray-600">Sum of the number of cleanup actions.</p>
        </div>

        {/* Top 3 States Section */}
        <div className="p-4 bg-gray-200 rounded">
          <h3 className="text-xl font-semibold">Top 3 States</h3>
          {topStates.map((state, index) => (
            <div key={index} className="p-4 bg-white border rounded-lg shadow-md mb-4">
              <h4 className="text-lg font-medium">{state.name}</h4>
              <p className="text-sm text-gray-500">{state.placeholder}</p>
            </div>
          ))}
        </div>

        {/* Top 3 Counties Section */}
        <div className="p-4 bg-gray-200 rounded">
          <h3 className="text-xl font-semibold">Top 3 Counties</h3>
          {topCounties.map((county, index) => (
            <div key={index} className="p-4 bg-white border rounded-lg shadow-md mb-4">
              <h4 className="text-lg font-medium">{county.name}</h4>
              <p className="text-sm text-gray-500">{county.placeholder}</p>
            </div>
          ))}
        </div>
      </div>

    </div>


  );
}

export default Analysis;
