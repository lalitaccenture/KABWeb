'use client'
import Image from "next/image"
import { MdLogout } from "react-icons/md";
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
import { analysisNewDropdown, analysisNewDropdownWithCity, applyFilter, getAnalysis, getAnalysisDashboard, getAnalysisDashboardMap, getAnalysisDashboardMapCity, getAnalysisDashboardWithCity, getAnalysisExternalData } from "../utils/api";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatNumber, formatNumberMillion } from "@/utils/common";
import { withCoalescedInvoke } from "next/dist/lib/coalesced-function";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useProfileStore } from "@/stores/profileStore";
import { Suspense } from 'react'

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
  date: string;
  radius: number
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
  const [statesNewData, setStatesNewData] = useState<any>([]);
  const [loadingAnalysisNewData, setLoadingAnalysisNewData] = useState<boolean>(false);
  const [countiesNewData, setCountiesNewData] = useState<any[]>([]);
  const [tractsNewData, setTractsNewData] = useState<any[]>([]);
  const [yearsNewData, setYearsNewData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("cleanup");
  const { data: session, status } = useSession();
  const router = useRouter();
  const stateFromStore = useProfileStore((s) => s.state);
  const searchParams = useSearchParams();
  useEffect(() => {
    const fromParam = searchParams.get("from");
    // @ts-ignore: Ignore TypeScript error
    if (session?.user?.state && fromParam === "login") {
      // @ts-ignore: Ignore TypeScript error
      useProfileStore.getState().setState(session.user.state);
    }
    // // @ts-ignore: Ignore TypeScript error
    // else if(session?.user?.state){
    //   // @ts-ignore: Ignore TypeScript error
    //   useProfileStore.getState().setState(session.user.state);
    // }


  }, [session, searchParams]);
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/"); // Redirect to login page
    }
  }, [status, router]);


  const fetchData = async () => {
    console.log("session", session)
    setLoadingExternalData(true);
    setLoadingAnalysisData(true);
    setLoadingAnalysisNewData(true);
    setLoadingMapData(true)
    setError(null);

    try {

      // const data = await getAnalysisExternalData();
      // setStatesData(data.States);
      // setCountiesData(data.Counties);
      // setTractsData(data.TractIDs);
      // setYearsData(data.Years);
      console.log("state", stateFromStore)
      setLoadingExternalData(false);
      // const dropD = await analysisNewDropdown();
      const dropD = await analysisNewDropdownWithCity();
      setStatesNewData(dropD?.Dropdown)
      setYearsNewData(dropD?.Years)
      const defaultState = dropD?.Dropdown.find((state: { value: string; }) => state.value === stateFromStore);
      if (defaultState) {
        setFilters(prevFilters => ({ ...prevFilters, state: defaultState }));
      }
      const queryParamsForCounty = {
        state: stateFromStore,
      };
      // const forCountyPopulate = await analysisNewDropdown(queryParamsForCounty);
      const forCountyPopulate = await analysisNewDropdownWithCity(queryParamsForCounty)
      setCountiesNewData(forCountyPopulate?.Dropdown)
      setYearsNewData(forCountyPopulate?.Years)
      setLoadingAnalysisNewData(false)

      // const value = await applyFilter();
      // setAnalysisData(value);

      const queryParamsForMap = {
        state: stateFromStore,
      };
      //const test = await getAnalysisDashboard();
      // const test = await getAnalysisDashboard(queryParamsForMap);
      const test = await getAnalysisDashboardWithCity(queryParamsForMap);
      setAnalysisData(test);
      //setMarkers(value?.map_data)



      const resp = await getAnalysisDashboardMapCity(queryParamsForMap);
      setMarkers(resp?.map_data)
      setZoom(5);
      if (resp?.centroid === "No location found") {

      }
      else {
        setCenter(resp?.centroid)
      }
      setLoadingMapData(false);

      setLoadingAnalysisData(false);
    } catch (error) {
      setError("Failed to fetch data, please try again later.");

      setLoadingAnalysisData(false);
      setLoadingAnalysisNewData(false)
      setLoadingExternalData(false);
      setLoadingMapData(false)
    } finally {

    }
  };
  useEffect(() => {
    if (stateFromStore) {
      fetchData(); // Call fetchData only if state has a value
    }
  }, [stateFromStore]);


  const handleFilterChange = (filter: string, selectedOption: any) => {
    if (filter == 'state') {
      setFilters(prevFilters => ({
        ...prevFilters,
        [filter]: selectedOption,
        county: null,
        tract: null
      }));
    }
    else if (filter == 'county') {
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
      state: filters?.state?.value || null,
      county: filters?.county?.value || null,
      tractid: filters?.tract?.value || null,
      year: filters?.year?.value || null,
    };

    const queryParamsForMap = {
      state: filters?.state?.value || null,
      county: filters?.county?.value || null,
      tractid: filters?.tract?.value || null,
      year: filters?.year?.value || null,
    };

    // Filter out undefined values
    // const cleanedQueryParams = Object.fromEntries(
    //   Object.entries(queryParams).filter(([_, v]) => v !== undefined)
    // );

    setLoadingAnalysisData(true);
    setLoadingMapData(true);
    try {
      // const res = await applyFilter(queryParams);
      // setAnalysisData(res);
      // setMarkers(res?.map_data)
      const res = await getAnalysisDashboardWithCity(queryParams);
      setAnalysisData(res);


      setLoadingAnalysisData(false);

      const resp = await getAnalysisDashboardMapCity(queryParamsForMap);
      if (resp?.centroid === "No location found") {

      }
      else {
        setCenter(resp?.centroid)
      }
      setMarkers(resp?.map_data)

      if (queryParams?.state && !queryParams?.county && !queryParams?.tractid) {
        // If state is present and county and tract are null
        setZoom(5);
      } else if (queryParams?.state && queryParams?.county && !queryParams?.tractid) {
        // If state and county are present and tract is null
        setZoom(6);
      } else if (queryParams?.state && queryParams?.county && queryParams?.tractid) {
        // If state, county, and tract are all present
        setZoom(7);
      }

      setLoadingMapData(false);


    } catch (error) {
      setLoadingAnalysisData(false);
      setLoadingMapData(false);
    }
  };

  const fetchDataAfterClear = async () => {
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
      const dropD = await analysisNewDropdownWithCity();
      setStatesNewData(dropD?.Dropdown)
      setYearsNewData(dropD?.Years)
      setLoadingAnalysisNewData(false)

      // const value = await applyFilter();
      // setAnalysisData(value);
      const test = await getAnalysisDashboardWithCity();
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
  }

  const handleClear = () => {
    setCenter([37.0902, -95.7129]);
    setZoom(4);
    setMarkers([]);
    setFilters(prevFilters => ({
      ...prevFilters,
      state: null,
      county: null,
      tract: null,
      year: null,
    }));

    fetchDataAfterClear();

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
    labels: labelsLine,
    datasets: [
      {
        label: '',
        data: Object.values(analysisData?.analytics?.trend_chart || {}),
        borderColor: '#5BAA76',
        pointBackgroundColor: '#5BAA76',


      },
    ],
  };


  const handleDropdownFurther = async (val: string, selectedOption: any) => {
    try {
      setLoadingAnalysisNewData(true)
      console.log("selectedOption", selectedOption)
      let queryParams;
      if ((val == "state")) {
        queryParams = {
          state: selectedOption?.value || null,
        };
      }
      else if (val == "county") {
        //setFilters({...filters,tract:null})
        queryParams = {
          state: filters?.state?.value || null,
          county: selectedOption?.value || null,
        };
      }
      else if (val == "tract") {
        //setFilters({...filters,tract:null})
        queryParams = {
          state: filters?.state?.value || null,
          county: filters?.county?.value || null,
          tractid: selectedOption?.value || null,
        };
      }

      const dropD = await analysisNewDropdownWithCity(queryParams);
      if (val == "state") {

        setCountiesNewData(dropD?.Dropdown)
        setYearsNewData(dropD?.Years)
        setLoadingAnalysisNewData(false)
      }
      else if (val == "county") {
        setTractsNewData(dropD?.Dropdown)
        setYearsNewData(dropD?.Years)
        setLoadingAnalysisNewData(false)
      }
      else if (val == "tract") {
        setYearsNewData(dropD?.Years)
        setLoadingAnalysisNewData(false)
      }
    }
    catch (error) {
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
  };




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
  if (status === "loading") {
    return <p>Loading...</p>; // Prevents UI flickering
  }


  return (
    <div className="min-h-screen w-full flex p-4" style={{ backgroundColor: "rgba(91, 170, 118, 0.1)" }}>


      {/* Top Buttons */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex gap-4" style={{ marginTop: "7px" }}>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#DCFCE7] rounded-full p-1 flex w-[520px]  h-[40px]  shadow-md" style={{ marginTop: '5rem' }}>
          {/* Litter Cleanup Analysis Button */}
          <button
            className={`relative w-1/2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${activeTab === "cleanup"
              ? "bg-green-600 text-white font-bold shadow-md"
              : "text-gray-500"
              }`}
            onClick={() => {
              setActiveTab("cleanup");
              router.push("/analysis-external");
            }}
          >
            Litter Cleanup Analysis
          </button>

          {/* Litter Survey Analysis Button */}
          <button
            className={`relative w-1/2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${activeTab === "survey"
              ? "bg-green-600 text-white font-bold shadow-md"
              : "text-gray-600"
              }`}
            onClick={() => {
              setActiveTab("survey");
              router.push("/analysis-kab");
            }}
          >
            Litter Survey Analysis
          </button>
        </div>

      </div>




      <div className="w-1/5 p-4 bg-white shadow-2xl rounded-lg flex flex-col" style={{ marginTop: '-6.5%', marginLeft: '-1%' }}>


        {/* Top Section */}
        <div className="flex flex-col items-center" style={{ marginTop: '-6%' }}>
          <p className="text-[#5BAA76] text-xl font-bold cursor-pointer font-neris" onClick={handleLogoClick}>
            LitterSense
          </p>
          <Image src="/powered.png" alt="Accenture" width={100} height={14} className="object-contain mt-[-4px]" />


        </div>

        {/* MENU Section */}
        <div className="mt-6" >
          <p className="text-gray-400 text-sm font-semibold mb-2">Menu</p>
          <div className="flex flex-col gap-2 ">
            <button className="flex items-center gap-2 p-2 bg-[#DCFCE7] text-green-700 rounded-lg w-full" onClick={() => router.push("/analysis-external")}>

              <span className="font-neris text-sm">Analysis</span>

            </button>
            <button className="flex items-center gap-2 p-2 bg-gray-100 text-gray-700 rounded-lg w-ful" onClick={() => router.push("/prediction")}>

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







      <div className="w-3/5 p-4 flex flex-col justify-start items-center gap-4" style={{ marginTop: '3%' }}>
        <div className="flex flex-col w-full p-4 bg-white rounded-md shadow-sm" style={{ width: '96%' }}>
          {/* Heading at the top */}
          <p className="font-semibold text-base mb-4">Filter Cleanup Events</p>

          {/* Dropdowns and Buttons in horizontal row */}
          <div className="flex flex-row" style={{ gap: '1.8%', flex: '1' }}>

            {/* State Dropdown */}
            <div style={{ width: "max-content", maxWidth: "21%", minWidth: "21%", flex: "0.2" }}>
              <label htmlFor="state" className="block text-base font-medium text-black-600 mb-2 font-neris">State</label>
              {loadingAnalysisNewData ? (
                <div>Loading states...</div>
              ) : (
                <Select
                  id="state"
                  value={filters.state}
                  placeholder="Select a State"
                  onChange={(selectedOption) => {
                    handleFilterChange('state', selectedOption)
                    handleDropdownFurther('state', selectedOption)
                  }}
                  options={statesNewData}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                      boxShadow: state.isFocused || state.hasValue ? "0px 2px 4px rgba(91, 170, 118, 0.3)" : "none",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": { borderColor: "#5BAA76" },
                      zIndex: 10,
                    }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                    placeholder: (base) => ({ ...base, color: "#C5C5C5", fontSize: "12px" }),
                    option: (base, { isSelected, isFocused }) => ({
                      ...base,
                      backgroundColor: isSelected ? "#5BAA76" : isFocused ? "#A5D6A7" : "white",
                      color: isSelected ? "white" : "black",
                      "&:active": { backgroundColor: "#5BAA76" },
                    }),
                    singleValue: (base) => ({ ...base, color: "black", fontWeight: "semibold" }),
                  }}
                />
              )}
            </div>

            {/* County Dropdown */}
            <div style={{ width: "max-content", maxWidth: "21%", minWidth: "34%", flex: "0.2", whiteSpace: 'nowrap' }}>
              <label htmlFor="county" className="block text-base font-medium text-black-600 mb-2 font-neris">City, County</label>
              {loadingAnalysisNewData ? (
                <div>Loading counties...</div>
              ) : (
                <Select
                  id="county"
                  value={filters.county}
                  onChange={(selectedOption) => {
                    handleFilterChange('county', selectedOption)
                    handleDropdownFurther('county', selectedOption)
                  }}
                  options={countiesNewData}
                  isDisabled={!filters?.state?.value}
                  placeholder="Select a County"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                      boxShadow: state.isFocused || state.hasValue ? "0px 2px 4px rgba(91, 170, 118, 0.3)" : "none",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": { borderColor: "#5BAA76" },
                      zIndex: 10,
                    }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                    placeholder: (base) => ({ ...base, color: "#C5C5C5", fontSize: "12px" }),
                    option: (base, { isSelected, isFocused }) => ({
                      ...base,
                      backgroundColor: isSelected ? "#5BAA76" : isFocused ? "#A5D6A7" : "white",
                      color: isSelected ? "white" : "black",
                      "&:hover": { backgroundColor: "#5BAA76", color: "white" },
                      "&:active": { backgroundColor: "#5BAA76" },
                    }),
                    singleValue: (base) => ({ ...base, color: "black", fontWeight: "semibold" }),
                  }}
                />
              )}
            </div>

            {/* Year Dropdown */}
            <div style={{ width: "max-content", maxWidth: "21%", minWidth: "17%", flex: "0.2" }}>
              <label htmlFor="year" className="block text-base font-medium text-black-600 mb-2 font-neris">Year</label>
              {loadingAnalysisNewData ? (
                <div>Loading years...</div>
              ) : (
                <Select
                  id="year"
                  value={filters.year}
                  onChange={(selectedOption) => handleFilterChange('year', selectedOption)}
                  options={yearsNewData}
                  placeholder="All"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused || state.hasValue ? "#5BAA76" : base.borderColor,
                      boxShadow: state.isFocused || state.hasValue ? "0px 2px 4px rgba(91, 170, 118, 0.3)" : "none",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": { borderColor: "#5BAA76" },
                      zIndex: 10,
                    }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                    placeholder: (base) => ({ ...base, color: "#C5C5C5", fontSize: "12px" }),
                    option: (base, { isSelected, isFocused }) => ({
                      ...base,
                      backgroundColor: isSelected ? "#5BAA76" : isFocused ? "#A5D6A7" : "white",
                      color: isSelected ? "white" : "black",
                      fontWeight: isSelected ? "600" : "normal",
                      "&:hover": { backgroundColor: "#5BAA76", color: "white" },
                      "&:active": { backgroundColor: "#5BAA76" },
                    }),
                    singleValue: (base) => ({ ...base, color: "#000000", fontWeight: "semibold" }),
                  }}
                />
              )}
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-row gap-2" style={{
              width: "max-content",
              maxWidth: "21%",
              minWidth: "21%",
              flex: "0.2",
              whiteSpace: 'nowrap'
            }}>
              <Button className="w-full bg-[#5BAA76] text-white hover:bg-[#5BAA76]" disabled={loadingAnalysisNewData || loadingAnalysisData} onClick={handleApply}>
                Apply
              </Button>
              <Button className="w-full bg-transparent text-black font-medium border border-[#5BAA76] rounded-md hover:bg-[#ffffff] hover:text-black transition" disabled={!isClearButtonEnabled} onClick={handleClear}>
                Reset
              </Button>
            </div>

          </div>
        </div>

        <p className="block text-base font-semibold text-black-600  font-neris" >Litter Cleanup Activity Map:</p>
        <div className="w-full h-96 p-4 rounded " style={{ marginTop: '-3%' }}>


          {loadingMapData ? (
            <div className="flex justify-center items-center h-full mt-4">

              <span className="text-xl text-gray-600">Loading map...</span>
            </div>
          ) : (
            <AnalysisMap markers={markers} zoom={zoom} center={center} />
          )}
        </div>

        <div className="w-full flex flex-wrap justify-center gap-4 mt-20" style={{ height: '27rem' }}>
          <div
            className="flex justify-between w-full"
            style={{ gap: '31px', marginLeft: '12px' }}
          >


          </div>


          <div
            className="p-4 bg-white rounded flex flex-col items-center"
            style={{ width: '47%', marginTop: '-4%' }}
          >

            {loadingAnalysisData ? (
              <div>Loading line chart...</div>
            ) : (
              <div>

                <p className="text-base font-semibold font-neris">Trend of Cleanup Programs Over Years</p>

                <Line options={optionsLine} data={dataLine} height={230} style={{ marginTop: '12%' }} />
              </div>
            )}
          </div>



          <div className="p-3 bg-white rounded flex flex-col items-center relative" style={{ width: '47%', marginTop: '-4%' }}>

            <p className="text-base font-semibold font-neris" >Break Down of Litter Types</p>


            {loadingAnalysisData ? (
              <div>Loading doughnut chart...</div>
            ) : (
              <div style={{ width: "350px", height: "350px", marginTop: "9%" }}>
                <Doughnut data={data} options={optionsDoughnut} />
              </div>

            )}

            {/* Text Outside the White Box (Aligned to Bottom-Right) */}
            <div className="absolute bottom-[-20px] right-2 text-xs text-gray-500">
              Source: Open Source Data
            </div>
          </div>


        </div>

      </div>







      <div className="w-1/5 p-4  bg-white rounded-lg shadow-lg min-w-[250px] mt-15" style={{ position: 'absolute', right: '0px', height: '72rem' }}>
        <div className="flex flex-col items-center p-4 rounded-lg bg-[#DCFCE7] w-[220px]">
          {/* Value */}
          <div className="flex items-center gap-1" style={{ marginLeft: '-14%' }}>
            <img src="/Brush.svg" alt="Broom Icon" className="w-7 h-7" />

            {loadingAnalysisData ? (
              <span>Loading Data...</span>
            ) : (
              <span className="text-2xl font-bold text-green-700 ">
                {formatNumber(analysisData?.analytics?.total_cleanups)}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="mt-2 text-black text-base font-semibold font-neris text-center">
            Total Cleanup Events
          </p>
        </div>


        {/* top 3 states */}

        <div className="p-2 rounded mt-5 font-neris">
          <p className="block text-base font-semibold text-black-600 font-neris">
            Top 3 States by Cleanup Events
          </p>
          {loadingAnalysisData ? (
            <div>Loading top states...</div>
          ) : (
            <div className="space-y-5">
              {Object.entries(analysisData?.analytics?.top_3_states || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-2  bg-gray-100 rounded-lg mb-2">
                  {/* Adjusted Indicator */}
                  <span className="w-1.5 h-1.5 bg-[#5BAA76] rounded-full relative -top-[8px]"></span>

                  {/* Text */}
                  <div>
                    <p className="text-base font-medium font-neris">{key}</p>
                    <p className="text-xs text-gray-500 font-neris">Events:<span className="text-black font-semibold">{formatNumber(Number(value))}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>





        <div className="p-1 rounded mt-5 font-neris">
          <p className="block text-base font-semibold text-black-600  font-neris">
            Top 3 Counties by Cleanup Events
          </p>
          {loadingAnalysisData ? (
            <div>Loading top counties...</div>
          ) : (
            <div className="space-y-6" style={{ marginLeft: '2%' }}>
              {Object.entries(analysisData?.analytics?.top_3_counties || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg mb-2">
                  {/* Green Indicator */}
                  <span className="w-1.5 h-1.5 bg-[#5BAA76] rounded-full relative -top-[8px]"></span>

                  {/* Text Content */}
                  <div>
                    <h4 className="text-base font-medium font-neris">{key}</h4>
                    <p className="text-xs text-gray-500 font-neris">Events:<span className="text-black font-semibold">{formatNumber(Number(value))}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


      </div>

    </div>


  );
}

export default function WrappedAnalysis() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Analysis />
    </Suspense>
  )
}

// export default Analysis;
