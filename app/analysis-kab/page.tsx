'use client';

import dynamic from "next/dynamic";
import { useState } from "react";
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title
} from 'chart.js';
import { Doughnut, Scatter } from 'react-chartjs-2';
//import Select from 'react-select';
import { Button } from "@/components/ui/button";
import { applyFilter } from "../utils/api";
const AnalysisKABMap = dynamic(() => import("../../src/components/AnalysisKABMap"), { ssr: false });
const Select = dynamic(() => import('react-select'), { ssr: false });

interface MarkerData {
    position: [number, number]; // Coordinates
    label: string; // Label for the marker
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

const AnalysisKAB = () => {

    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [zoom, setZoom] = useState<number>(4);
    const [center, setCenter] = useState<[number, number]>([37.0902, -95.7129]);
    const [filters, setFilters] = useState<Filters>({
        state: null,
        parameter: null,
    });

    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const dataForScatter = {
        datasets: [
            {
                label: 'A dataset',
                data: Array.from({ length: 100 }, () => ({
                    x: 74,
                    y: 87,
                })),
                backgroundColor: 'rgba(255, 99, 132, 1)',
            },
        ],
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
    };

    const handleApply = async () => {

        const payload = {
            state: filters.state?.value || null,
            county: filters.parameter?.value || null,
        };

        console.log("payload", payload)

        try {
            const res = applyFilter(payload);
        } catch (error) {
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

    return (

        <div className="flex w-full gap-4 mt-4">

            <div className="w-1/5 p-4">
                
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
                        <label htmlFor="parameterName" className="block text-sm font-medium text-gray-700">Parameter Name</label>
                        <Select
                            id="parameterName"
                            value={filters.parameter}
                            onChange={(selectedOption) => handleFilterChange('parameter', selectedOption)}
                            options={[
                                { value: 'bins_density', label: 'Bins Density' },
                                { value: 'random', label: 'Random' },
                                // Add more state options
                            ]}
                            placeholder="Select a State"
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
                    <AnalysisKABMap markers={markers} zoom={zoom} center={center} />
                </div>

                <div className="w-full flex gap-4">
                    <div className="w-1/2 p-4 bg-gray-200 rounded">
                        
                        <h3 className="text-xl font-semibold mb-2 text-center">No of Cleanups by Year</h3>
                        <Scatter options={options} data={dataForScatter} />
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
                    <h3 className="text-xl font-semibold">Total Estimated Litter</h3>
                    <span className="block text-lg font-bold">8768</span>
                </div>


                <div className="p-4 bg-gray-200 rounded">
                    <h3 className="text-xl font-semibold">Estimated Litter Density</h3>
                    <span className="block text-lg font-bold">8768</span>
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

            </div>

        </div>


    );
}

export default AnalysisKAB;
