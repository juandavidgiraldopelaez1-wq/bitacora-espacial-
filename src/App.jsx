
import { useEffect, useState } from "react";
import NoticiaCard from "./components/NoticiaCard/NoticiaCard.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
    const [noticias, setNoticias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [termino, setTermino] = useState("");

    function buscar(evento) {
        evento.preventDefault();

        const texto = evento.currentTarget.elements.q.value.trim();

        setTermino(texto);
    }

    useEffect(() => {
        const controlador = new AbortController();

        async function obtenerNoticias() {
            try {
                setCargando(true);
                setError(null);

                const parametros = new URLSearchParams({
                    limit: "12"
                });

                if (termino) {
                    parametros.set("search", termino);
                }

                const respuesta = await fetch(
                    `${API_URL}/articles/?${parametros.toString()}`,
                    {
                        signal: controlador.signal
                    }
                );

                if (!respuesta.ok) {
                    throw new Error(
                        `Error al obtener las noticias: ${respuesta.status}`
                    );
                }

                const datos = await respuesta.json();

                setNoticias(datos.results ?? []);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setError(error.message);
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        obtenerNoticias();

        return () => {
            controlador.abort();
        };
    }, [termino]);

    return (
        <>
            <header className="contenedor cabecera">
                <h2>Bitácora Espacial</h2>

                <nav aria-label="Principal">
                    <a href="#">Noticias</a>
                    <a href="#">Blogs</a>
                    <a href="#">Acerca</a>
                </nav>
            </header>

            <main className="contenedor">
                <h1>Exploración espacial, más cerca que nunca</h1>

                <form className="buscador" onSubmit={buscar}>
                    <label htmlFor="busqueda">
                        Buscar por tema
                    </label>

                    <input
                        id="busqueda"
                        name="q"
                        type="search"
                        placeholder="Ej.: Mars, Artemis, SpaceX"
                    />

                    <button type="submit">
                        Buscar
                    </button>
                </form>

                <section aria-labelledby="ultimas-noticias">
                    <h2 id="ultimas-noticias">Últimas noticias</h2>

                    {cargando && (
                        <p role="status">
                            Cargando noticias espaciales...
                        </p>
                    )}

                    {error && (
                        <p role="alert">
                            Error al cargar las noticias: {error}
                        </p>
                    )}

                    {!cargando && !error && noticias.length === 0 && (
                        <p role="status">
                            No hay noticias para "{termino}".
                        </p>
                    )}

                    {!cargando && !error && noticias.length > 0 && (
                        <div className="grid-noticias">
                            {noticias.map((noticia) => (
                                <NoticiaCard
                                    key={noticia.id}
                                    titulo={noticia.title}
                                    resumen={noticia.summary}
                                    imagen={noticia.image_url}
                                    fuente={noticia.news_site}
                                    fecha={noticia.published_at}
                                    enlace={noticia.url}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer className="contenedor">
                <p>
                    Datos proporcionados por{" "}
                    <a
                        href="https://www.spaceflightnewsapi.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Spaceflight News API
                    </a>
                </p>
            </footer>
        </>
    );
}
