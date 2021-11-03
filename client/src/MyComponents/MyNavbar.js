import { Navbar, Button, Container } from "react-bootstrap";
import { RiEdit2Line, RiLoginCircleLine, RiLogoutCircleRLine, RiAddCircleLine } from "react-icons/ri";
import { FcStatistics } from "react-icons/fc";
import { Link } from 'react-router-dom';


function MyNavbar(props) {
    /* se lo user non è loggato: visualizzo solo il navbar Brand e il pulsante di login.
        Il pulsante di login se schiacciato mostra il modal di login
    */

    //se l'utente non è loggato --> mostro solamente il brand e il pulsante di login
    if (props.loggedAdmin === null) {
        return <Container fluid className="container-fluid" id="navbarContainer">
            <Navbar id="navbar" expand="md" variant="light">

                
                <Container className="col-md-3" fluid id="logoContainer">
                    <Navbar.Collapse  >
                        <Navbar.Brand id="navBrand" href="/">
                            <RiEdit2Line className="mr-1" size="30" variant="light" floodColor="white" /> PatQuestionario
                        </Navbar.Brand>
                    </Navbar.Collapse>
                </Container>


                <Container className="col-md-9" fluid id="loginContainer">
                    <Button id="buttonLogin" size="lg" onClick={() => props.setShowLoginModal(true)} >
                        <RiLoginCircleLine id="imgLogin" className="mr-1" size="30" variant="light" color="white" />
                        Login
                    </Button>
                </Container>

            </Navbar>
        </Container>
    }


    //altrimenti mostro anche i bottoni di aggiunta di un nuovo questionario 
    //e visualizzazione dei questionari 
    else {
        return <Container fluid className="full-width" id="navbarContainer">
            <Navbar id="navbar" expand="md" variant="light">

                <Container className="col-md-3" fluid id="logoContainer">
                    <Navbar.Collapse  >
                        <Navbar.Brand id="navBrand" href="/" >
                            <RiEdit2Line className="mr-1" size="30" variant="light" color="white" /> PatQuestionario
                        </Navbar.Brand>
                    </Navbar.Collapse>
                </Container>


                <Container className="col-md-3" fluid id="addQuestionarioContainer">
                    <Link to='/add/questionari'>
                        <Button id="buttonAddQuestionario" size="lg">
                            <RiAddCircleLine className="mr-1" size="30" variant="light" color="white" /> Nuovo Questionario
                        </Button>
                    </Link>
                </Container>


                <Container className="col-md-3" fluid id="viewResultsContainer">
                    <Link to='/view/questionari'>
                        <Button id="buttonViewResults" size="lg">
                            <FcStatistics className="mr-1" size="30" variant="light" color="white" /> Guarda Risultati
                        </Button>
                    </Link>
                </Container>


                <Container className="col-md-3" fluid id="logoutContainer">
                    <Button id="buttonLogout" size="lg" onClick={props.handleLogOut}>
                        <RiLogoutCircleRLine id="imgLogout" className="mr-1" size="30" variant="light" color="white" />
                        Logout {props.loggedAdmin.nome}
                    </Button>
                </Container>


            </Navbar>
        </Container>

    }

}

export default MyNavbar;