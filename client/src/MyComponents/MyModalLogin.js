import { Modal, Button, Col, Alert, Container, Form } from "react-bootstrap";
import { MdPerson } from "react-icons/md";
import { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';




function MyModalLogin(props) {

    //serve per mostrare/nascondere il modal
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loginValid, setLoginValid] = useState(false);

    // enables / disables react-bootstrap validation report

    function handleSubmit(event) {
        event.preventDefault();

        const credentials = { username: email, password: password };
        // SOME VALIDATION, ADD MORE!!!
        let valid = true;
        if (email === '' || password === '' || password.length < 6)
            valid = false;

        if (valid) {

            props.doLogIn(credentials)
                .catch((err) => {
                    setErrorMessage("Email o password non conformi. Riprovare!");
                    setLoginValid(false);
                })
        }

        else {
            // show a better error message...
            setErrorMessage("Email o password non conformi. Riprovare!")
            setLoginValid(false);

        }

    }

    return <Modal id="modalLogin" show={props.showLoginModal} onHide={props.handleCloseModal} >
        <Modal.Header>
            <Modal.Title>
                <MdPerson className="mr-1" size="35" variant="light" />
                Login
            </Modal.Title>
            <Col className="col-md-4">
                <Button id="myCloseButton" onClick={props.handleCloseModal}>X</Button>
                {
                    props.showLoginModal ? <></> : <Link to='/'></Link>
                }
            </Col>
        </Modal.Header>

        <Modal.Body>
            <Form onSubmit={handleSubmit}>
                <Form.Group id="formLogin" size="lg" controlId="email">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control autoFocus type="email" value={email} placeholder="inserisci la tua email"
                        onChange={(ev) => setEmail(ev.target.value)} required="required">
                    </Form.Control>
                </Form.Group>

                <Form.Group id="formLogin" size="lg" controlId="password">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control autoFocus type="password" value={password} placeholder="Inserisci la password"
                        onChange={(ev) => setPassword(ev.target.value)} required="required">
                    </Form.Control>
                </Form.Group>

                <Container id="containerFormSubmit">

                    <Button block size="lg" type="submit" id="formSubmit" onClick={() => handleSubmit}>Conferma</Button>
                    {
                        loginValid ? <Redirect to='/view/questionari'></Redirect> : <></>
                    }
                </Container>
            </Form>

        </Modal.Body>
        <Alert>
            {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
        </Alert>
    </Modal>
}

export default MyModalLogin;