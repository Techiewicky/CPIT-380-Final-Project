import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Brain, Upload, Activity, Linkedin, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import backgroundImage from '../assets/backgwa.webp';

const teamMembers = [
  { name: "Baraa Majed Algomlas", title: "Student ID: 2047853", linkedin: "https://www.linkedin.com/in/baraa-majed-algomlas-041131316" },
  { name: "Osamma Yasser Alghamdi", title: "Student ID: 2137555", linkedin: "#" },
  { name: "Khalid Ahmed Alghamdi", title: "Student ID: 2135051", linkedin: "https://www.linkedin.com/in/khalid-ahmed-alghamdi-9858b4314" },
  { name: "Faisal Alzahrani", title: "Student ID: 2137165", linkedin: "#" },
  { name: "Abdulrahman Barashid", title: "Student ID: 223602", linkedin: "#" },
  { name: "Dr.Badrddin Alturki", title: "Course Instructor", linkedin: "#" }
];

const BrAInApp = () => {
  const [file, setFile] = useState(null);
  const [diseaseType, setDiseaseType] = useState('Brain Tumor');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
    setResult(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []}
  });

  const analyzeImage = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const diseaseMap = {
      'Brain Tumor': 'cancer',
      "Alzheimer's Disease": 'alzheimer',
      'Multiple Sclerosis': 'ms',
    };

    const selectedDisease = diseaseMap[diseaseType];

    try {
      const response = await fetch(`http://127.0.0.1:5000/predict/${selectedDisease}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to analyze image');
      }

      const data = await response.json();
      console.log('Received data:', data);

      if (data.disease && data.predicted_class) {
        setResult(data);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError('An error occurred while analyzing the image. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat p-8 relative" 
         style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}>
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 relative mt-16"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <h1 className="text-7xl font-bold mb-2 relative" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="text-cyan-400">Br</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-pulse">
              AI
            </span>
            <span className="text-cyan-400">n</span>
          </h1>
          <p className="text-2xl text-gray-300 font-light tracking-wide">
            Revolutionizing brain disease diagnosis with AI
          </p>
        </motion.div>
  
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-black bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-3xl p-8 shadow-2xl mb-8 border border-cyan-500 border-opacity-30"
        >
          <div 
            {...getRootProps()} 
            className={`border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'border-purple-400 bg-purple-400 bg-opacity-20' : 'border-cyan-400 hover:border-purple-400 hover:bg-purple-400 hover:bg-opacity-10'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center">
                <img src={URL.createObjectURL(file)} alt="Uploaded scan" className="max-h-48 rounded-lg shadow-lg" />
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-20 h-20 mx-auto text-cyan-400 animate-bounce" />
                <p className="text-xl text-cyan-100 font-light">Drag and drop a medical scan image here, or click to select a file</p>
              </div>
            )}
          </div>
  
          <div className="mt-8 space-y-6">
            <div className="relative">
              <select 
                value={diseaseType} 
                onChange={(e) => setDiseaseType(e.target.value)}
                className="w-full p-4 rounded-xl bg-black bg-opacity-50 text-cyan-100 border border-cyan-500 border-opacity-50 focus:border-purple-400 focus:outline-none appearance-none shadow-inner transition duration-300"
              >
                <option value="Brain Tumor">Brain Tumor</option>
                <option value="Alzheimer's Disease">Alzheimer's Disease</option>
                <option value="Multiple Sclerosis">Multiple Sclerosis</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-100">
                <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
  
            <div className="flex justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={analyzeImage} 
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition duration-300 flex items-center justify-center disabled:opacity-50 shadow-lg"
              >
                {loading ? <Activity className="animate-spin mr-2" /> : <Brain className="mr-2" />}
                {loading ? 'Analyzing...' : 'Analyze Scan'}
              </motion.button>
            </div>
          </div>
  
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-xl text-white"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2" />
                <h3 className="font-semibold">Error</h3>
              </div>
              <p className="mt-2">{error}</p>
            </motion.div>
          )}
  
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-black bg-opacity-50 rounded-xl shadow-inner border border-cyan-500 border-opacity-50"
            >
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">Analysis Result</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-lg text-cyan-100">Disease Type: <span className="font-semibold text-purple-300">{result.disease}</span></p>
                </div>
                <div>
                  <p className="text-lg text-cyan-100">Predicted Class: <span className="font-semibold text-purple-300">{result.predicted_class}</span></p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
  
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-cyan-500 border-opacity-30"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Our Expert Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.05 }}
                className="bg-black bg-opacity-50 p-6 rounded-xl transition-all duration-300 transform hover:bg-opacity-70 shadow-lg border border-cyan-500 border-opacity-30"
              >
                <h3 className="text-xl font-semibold text-cyan-300">{member.name}</h3>
                <p className="text-sm text-gray-300">{member.title}</p>
                <a 
                  href={member.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center text-purple-400 hover:text-purple-300 transition duration-300"
                >
                  <Linkedin className="w-5 h-5 mr-2" />
                  LinkedIn Profile
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 z-0"></div>
    </div>
  );
}

export default BrAInApp;