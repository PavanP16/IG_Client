import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Modal from "react-modal";

import { CalendarSearch, MailSearch } from "lucide-react";
import { CgProfile } from "react-icons/cg";
import { IoCloseCircle } from "react-icons/io5";

import RoleCard from "../FindJob/RoleCard";
import { setApplied } from "../../../redux/jobseekerReducer";

import toast from "react-hot-toast";
import axios from "axios";

const SavedJobCard = ({ job }) => {
  const truncateString = (str, maxLength) => {
    if (str.length <= maxLength) {
      return str;
    } else {
      return str.substring(0, maxLength) + "...";
    }
  };

  const [modalIsOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (modalIsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto"; // Reset overflow on component unmount
    };
  }, [modalIsOpen]);

  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 1000,
    },
    content: {
      top: "390px",
      left: "60vw",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#fff",
      borderRadius: "10px",
      outline: "none",
      padding: "2rem",
      position: "fixed",
      width: "70vw",
      height: "90vh",
      overflowY: "scroll",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", // Optional shadow for the modal
      scrollbarWidth: "thin", // For Firefox
      scrollbarColor: "#4a4a4a #e5e5e5", // For Firefox
      zIndex: 1001,
    },
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div className="shadow-md bg-white rounded-lg p-3 pt-4 w-[32%] min-h-[25.7vh]">
      <div className="flex items-end justify-between">
        <h5
          className={`${
            job?.location ? "bg-emerald-500" : "bg-amber-400"
          } rounded-full text-white p-1 text-xs`}
        >
          {job?.location ? job?.location : "Work From Home"}
        </h5>
        <h5 className="font-[600] text-sm">
          ₹ {Number(job?.salary).toLocaleString("en-IN")} / yr
        </h5>
      </div>

      <h1 className="mt-2 text-xl text-center font-bold tracking-wider">
        {job.position}
      </h1>
      <h1 className="text-center text-sm text-blue-500">{job.companyName}</h1>

      <div className="flex mt-5 w-[90%] mx-auto gap-3 flex-wrap">
        {job?.skills
          ?.slice(0, Math.min(4, job?.skills?.length))
          .map((role, index) => (
            <p
              key={index}
              className="text-xs p-1 bg-gray-200 text-gray-500 rounded"
            >
              {role}
            </p>
          ))}
      </div>

      <p className="mt-4 w-[90%] mx-auto text-xs">
        {truncateString(job?.jobDesc, 90)}
      </p>
      <hr className="mt-4 w-[90%] mx-auto"></hr>
      <h1 className="mt-4 text-center cursor-pointer" onClick={openModal}>
        View Job
      </h1>
      <Modals
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        customStyles={customStyles}
        job={job}
      />
    </div>
  );
};

export default SavedJobCard;

const Modals = ({ modalIsOpen, closeModal, customStyles, job }) => {
  const nav = useNavigate();
  const user = useSelector((state) => state.jobseeker.data);
  const dispatch = useDispatch();

  const applyHandler = async () => {
    if (!isDisabled) {
      try {
        const res = await axios.post(
          import.meta.env.VITE_SERVER + "/api/jobseeker/applyJob",
          { uid: user.uid, jid: job._id },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        if (res.status == 200) {
          dispatch(
            setApplied({
              jobId: job._id,
              uid: user.uid,
              status: "pending",
              createdAt: new Date(),
            })
          );
          toast.success("Job Applied!");
          nav("/jobseeker/profile");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error Occured : " + error.response?.data?.msg, {
          className: "text-red-500",
        });
      }
    } else {
      toast("Already applied to the Job!");
    }
  };

  const isDisabled = user?.applications?.some(
    (application) => application.jobId === job._id
  );

  const color = (status) => {
    if (status === "rejected") {
      return "bg-red-200 text-red-600 ";
    } else if (status === "accepted") {
      return "bg-green-200 text-green-600";
    } else {
      return "bg-yellow-100 text-yellow-500";
    }
  };

  const getStatus = (jobId) => {
    const application = user.applications.filter((app) => app.jobId == jobId);
    return application[0]?.status;
  };
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Example Modal"
    >
      <div className="flex gap-96">
        <button onClick={closeModal}>
          <IoCloseCircle className="text-3xl" />
        </button>
        <h1 className="font-bold text-4xl text-center">{job.companyName}</h1>
      </div>

      <h1 className="mt-6 text-lg font-[600]">Job Description</h1>
      <p className="mt-2 text-[500] text-gray-500">{job.jobDesc}</p>

      <div className="w-fit mt-6 p-4 border flex flex-col gap-3 rounded shadow">
        <h1 className="font-[600]">Activity on InspiringGo</h1>
        <div className="flex gap-5">
          <div className="flex gap-1 items-center">
            <CalendarSearch size={19} />
            <h2>
              Hiring since{" "}
              {new Date(job?.postedDate).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
          </div>
          <div className="flex gap-1 items-center">
            <MailSearch size={19} />
            <h2>{job.totalPositions} oppurtunities posted</h2>
          </div>
          <div className="flex gap-1 items-center">
            <CgProfile size={21} />
            <h2>{job.totalPositions - job.vacancies} candidates hired</h2>
          </div>
        </div>
      </div>

      <h3 className="mt-4 font-[600]">Responsibility</h3>
      <ul className="ml-5 text-gray-500" style={{ listStyleType: "disc" }}>
        <br />
        {job?.responsibilities.map((res, idx) => (
          <li key={idx}>{res}</li>
        ))}
      </ul>

      <h1 className="mt-8 text-lg font-[600]">Qualifications</h1>
      <div className="flex mt-3 gap-3 items-stretch flex-wrap">
        {job?.skills?.map((role, index) => (
          <RoleCard key={index} role={role} />
        ))}
      </div>

      <h1 className="mt-8 text-lg font-[600]">Benefits</h1>
      <div className="flex mt-3 gap-3 items-stretch flex-wrap">
        {job?.benefits.split(",").map((benifit, index) => (
          <p
            key={index}
            className="text-sm p-1 bg-gray-200 text-gray-500 rounded"
          >
            {benifit}
          </p>
        ))}
      </div>

      <h1 className="mt-8 text-lg font-[600]">Job Summary</h1>
      <ul className="ml-5 text-gray-500" style={{ listStyleType: "disc" }}>
        <br></br>
        <li>
          Posted on: {new Date(job?.postedDate).toLocaleDateString("en-US")}
        </li>
        <li>Vacancy : {job?.vacancies}</li>
        <li>Salary : ₹ {Number(job?.salary).toLocaleString("en-IN")}</li>
        {job?.location && <li>Location : {job?.location}</li>}
        <li>Job Nature : {job?.location ? "on Site" : "Work From Home"}</li>
      </ul>
      <button
        onClick={applyHandler}
        className={
          "mt-8 text-center m-auto tracking-wider py-2 px-4 rounded focus:outline-none focus:shadow-outline capitalize " +
          (isDisabled
            ? color(getStatus(job._id))
            : "bg-blue-600 hover:bg-blue-700 text-white")
        }
        disabled={isDisabled}
      >
        {isDisabled ? getStatus(job._id) : "Apply"}
      </button>
    </Modal>
  );
};
