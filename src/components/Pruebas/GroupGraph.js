import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from '../AuthContext/AuthContext';
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import Layout from '../Layout/Layout';
import { BASE_URL } from '../config';
import '../../styles/Graph.css';

const GroupGraph = () => {
    const { auth } = useAuth();
    const { pruebaId, groupId } = useParams();
    const [groupData, setGroupData] = useState(null);
    const [resultadosAprendizaje, setResultadosAprendizaje] = useState([]);
    const [error, setError] = useState(null);

    const config = {
        headers: {
            Authorization: `${auth.token}`,
        }
    };

    useEffect(() => {
        axios
            .get(`${BASE_URL}/api/pruebas/${pruebaId}`, config)
            .then((response) => {
                const prueba = response.data.prueba;
                const group = prueba.grupos.find((g) => g._id === groupId);
                setGroupData(group);
                setResultadosAprendizaje(prueba.resultadosAprendizaje); // Guardar los resultados de aprendizaje
            })
            .catch((error) => {
                setError("Error fetching group data: " + error.message);
            });
    }, [pruebaId, groupId]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!groupData) {
        return <div>Loading...</div>;
    }

    // Configuración de los datos para la gráfica general del grupo
    const generalData = {
        labels: ["Promedio del Grupo"],
        datasets: [
            {
                label: "Promedio",
                data: [groupData.promedioGrupo],
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
                barThickness: 50,
                maxBarThickness: 80
            },
        ],
    };

    // Configuración de los datos para la gráfica de Resultados de Aprendizaje (RA)
    const raLabels = groupData.promediosRA.map((ra) => {
        const raData = resultadosAprendizaje.find((r) => r._id === ra.ra);
        return raData ? raData.nombre : "RA desconocido";
    });

    const raData = {
        labels: raLabels,
        datasets: [
            {
                label: "Promedio del RA",
                data: groupData.promediosRA.map((ra) => ra.promedio),
                backgroundColor: "rgba(153, 102, 255, 0.6)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 1,
                barThickness: 50,
                maxBarThickness: 80
            },
        ],
    };

    // Opciones para las gráficas
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Permite controlar el tamaño del gráfico
        scales: {
            y: {
                min: 0, // Define el rango mínimo del eje Y
                max: 5, // Define el rango máximo del eje Y
                ticks: {
                    stepSize: 1, // Define el tamaño del paso en el eje Y
                },
            },
        },
    };

    return (
        <Layout>
            <div className="graph-container">
                <h2>Gráfica de Promedio General del Grupo</h2>
                <div className="chart general-average-chart">
                    <Bar data={generalData} options={chartOptions} />
                </div>

                <h2>Gráfica de Promedio por Resultados de Aprendizaje (RA)</h2>
                <div className="chart ra-chart">
                    <Bar data={raData} options={chartOptions} />
                </div>
            </div>
        </Layout>
    );
};

export default GroupGraph;