import { BrowserRouter as Router, Route, Switch, useParams, useHistory } from "react-router-dom";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import * as ReactBootstrap from "react-bootstrap";
import "./index.css";

export type Product = {
    id: number;
    name: string;
    image: string;
    link: string;
    min_price: number;
    max_price: number;
    is_available: boolean;
};

let products: Product[];

export const updateProducts = async (): Promise<void> => {
    const response = await axios.get<Product[]>(`http://${window.location.hostname}:5000/`);
    products = response.data;
};

const Header = () => {
    return (
        <header className="bg-dark py-5">
            <div className="container px-4 px-lg-5 my-5">
                <div className="text-center text-white">
                    <h1 className="display-4 fw-bolder">Chá de Panela</h1>
                    <p className="lead fw-normal text-white-50 mb-0">Julia e Rodrigo</p>
                </div>
            </div>
        </header>
    );
};

const Product = (product: Product, count: number) => {
    const [popUpNoLink, setPopUpNoLinkState] = useState(false);
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const confirmBuy = async () => {
        setLoading(true);
        await new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
        history.push(`/confirm/${product.id}`);
        setLoading(false);
    };

    const linkToBuy = () => {
        if (product.link !== "") {
            window.open(product.link);
        } else {
            setPopUpNoLinkState(true);
        }
    };

    const goBack = () => {
        setPopUpNoLinkState(false);
    };

    return (
        <div key={count}>
            <div className="col mb-5">
                <div className="card h-100">
                    <img className="card-img-top" src={product.image} alt="..." />
                    <div className="card-body p-4">
                        <div className="text-center">
                            <h5 className="fw-bolder">{product.name}</h5>
                            R${product.min_price}
                        </div>
                    </div>
                    <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                        <div className="text-center">
                            <a className="btn btn-outline-dark mt-auto" onClick={linkToBuy}>
                                Link para compra
                            </a>
                            <br></br>
                            <br></br>
                            {loading ? (
                                <ReactBootstrap.Spinner animation="border" />
                            ) : (
                                <a className="btn btn-outline-dark mt-auto" onClick={confirmBuy}>
                                    Confirmar compra
                                </a>
                            )}
                        </div>
                    </div>
                    {popUpNoLink && (
                        <div className="_modal">
                            <div className="modal-content">
                                <p className="text-center">Produto sem link, compre onde preferir!</p>
                                <div className="text-center">
                                    <button className="btn btn-outline-dark mt-auto" onClick={goBack}>
                                        Voltar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Confirm = () => {
    const [inputValid, setInputValid] = useState(false);
    const [loadingConfirm, setLoadingConfirm] = useState(false);
    const [loadingBack, setLoadingBack] = useState(false);
    const [popUpOn, setPopUpOn] = useState(false);

    const confirmBuy = async () => {
        setLoadingConfirm(true);
        const inputFirstName = document.getElementById("input-first-name")! as HTMLInputElement;
        const inputLastName = document.getElementById("input-last-name")! as HTMLInputElement;
        const inputEmail = document.getElementById("input-email")! as HTMLInputElement;

        const data = JSON.stringify({
            product_id: id,
            first_name: inputFirstName.value,
            last_name: inputLastName.value,
            email: inputEmail.value,
        });

        const config = { headers: { "Content-Type": "application/json" } };

        await axios.post(`http://${window.location.hostname}:5000/`, data, config);

        setPopUpOn(true);
        setLoadingConfirm(false);
    };

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const checkInputs = () => {
        const inputFirstName = document.getElementById("input-first-name")! as HTMLInputElement;
        const inputLastName = document.getElementById("input-last-name")! as HTMLInputElement;
        const inputEmail = document.getElementById("input-email")! as HTMLInputElement;

        if (
            inputFirstName.value === "" ||
            inputLastName.value === "" ||
            inputEmail.value === "" ||
            validateEmail(inputEmail.value) === null
        ) {
            setInputValid(false);
        } else {
            setInputValid(true);
        }
    };

    const history = useHistory();

    const rootPage = async () => {
        setLoadingBack(true);
        await updateProducts();
        history.push("/");
        setLoadingBack(false);
    };

    const { id } = useParams() as { id: string };
    const product = products.find((product) => product.id === parseInt(id));
    if (product !== undefined) {
        return (
            <div>
                <div className="col mb-5">
                    <div className="card h-100">
                        <div className="card-body p-4">
                            <div className="text-center">
                                <img
                                    className="card-img-top text-start w-25 text-center"
                                    src={product.image}
                                    alt="..."
                                />
                                <br></br>
                                <br></br>
                                <h5 className="fw-bolder">{product.name}</h5>
                                R${product.min_price}
                            </div>
                        </div>
                        <div className="card-footer p-4 pt-0 border-top-0 bg-transparent text-center">
                            <input
                                id="input-first-name"
                                className="text-center mt-auto"
                                placeholder="Nome"
                                onChange={checkInputs}
                            ></input>
                        </div>
                        <div className="card-footer p-4 pt-0 border-top-0 bg-transparent text-center">
                            <input
                                id="input-last-name"
                                className="text-center mt-auto"
                                placeholder="Sobrenome"
                                onChange={checkInputs}
                            ></input>
                        </div>
                        <div className="card-footer p-4 pt-0 border-top-0 bg-transparent text-center">
                            <input
                                id="input-email"
                                className="text-center mt-auto"
                                placeholder="Email"
                                onChange={checkInputs}
                            ></input>
                        </div>
                        <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                            <div className="text-center">
                                {loadingConfirm ? (
                                    <ReactBootstrap.Spinner animation="border" />
                                ) : (
                                    <button
                                        className="btn btn-outline-dark mt-auto"
                                        onClick={confirmBuy}
                                        disabled={!inputValid}
                                    >
                                        Confirmar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {popUpOn && (
                    <>
                        <div className="_modal">
                            <div className="modal-content">
                                <p className="text-center">Compra confirmada!</p>
                                <div className="text-center">
                                    {loadingBack ? (
                                        <ReactBootstrap.Spinner animation="border" />
                                    ) : (
                                        <button className="btn btn-outline-dark mt-auto" onClick={rootPage}>
                                            Pagina inicial
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }
    return <div></div>;
};

const Products = () => {
    const [ascending, setAscendingState] = useState(false);

    const sortProducts = (ascending: boolean) => {
        products = products.sort((a, b) => (ascending ? a.min_price - b.min_price : b.min_price - a.min_price));
    };
    
    const orderedProductsElements = (ascending: boolean) => {
        let count = 0;
        const productsElements: JSX.Element[] = [];
        sortProducts(ascending);
        for (const product of products) {
            productsElements.push(Product(product, count));
            count++;
        }

        return productsElements;
    };

    return (
        <div>
            <br></br>
            <nav>
                <ul>
                    <li>
                        <div>
                            Ordem<div id="down-triangle"></div>
                        </div>
                        <ul>
                            <li>
                                <a
                                    className="order-button"
                                    onClick={() => {
                                        setAscendingState(true);
                                    }}
                                >
                                    Preco - menor para maior<div className="circle"></div>
                                </a>
                            </li>
                            <li>
                                <a
                                    className="order-button"
                                    onClick={() => {
                                        setAscendingState(false);
                                    }}
                                >
                                    Preco - maior para menor<div className="circle"></div>
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>

            <div className="product-section">
                <section className="py-5">
                    <div className="container px-4 px-lg-5 mt-5">
                        <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
                            {orderedProductsElements(ascending)}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const render = async () => {
    await updateProducts();
    ReactDOM.render(
        <React.StrictMode>
            <Router>
                <Header />
                <Switch>
                    <Route exact path="/">
                        <Products />
                    </Route>
                    <Route exact path="/confirm/:id">
                        <Confirm />
                    </Route>
                    <Route exact path="/no-link"></Route>
                </Switch>
            </Router>
        </React.StrictMode>,
        document.getElementById("root")
    );
};

render();
