import { Row, Container, Form} from "react-bootstrap"
import { useState } from "react";

function DomandaAperta(props) {

    const [err, setErr] = useState(props.domanda.min === 0 ? "" : "Non lasciare vuoto un form obbligatorio");

    const handleChange = (event) => {
        event.preventDefault();

        props.addRisposta(event.target.value, props.domanda.pos)

        if (props.domanda.min === 1) {
            if (!event.target.value || event.target.value === '') {
                props.addError("Non lasciare incompleto un form obbligatorio", props.domanda.pos);
                setErr("Non lasciare incompleto un form obbligatorio")
                return;
            }
        }
        if (event.target.value.length > 200) {
            props.addError("Testo troppo lungo", props.domanda.pos);
            setErr("Testo troppo lungo");
        }
        else {
            props.addRisposta(event.target.value, props.domanda.pos);
            setErr("");
            props.addError("", props.domanda.pos);
        }
    }


    if (!props.readonly)
        return <Container id="domandaOpzionale">
            <Form.Group size="lg" >
                <Form.Label style={{fontSize: 22, fontStyle: "italic", fontWeight: 500}}>{props.domanda.quesito}</Form.Label>
                {props.domanda.min === 1 ?
                    <>
                        <Form.Label style={{ color: "red", marginLeft: "10px" }}> *</Form.Label>
                        <Form.Text as={Row} muted style={{marginLeft: "10px"}}>OBBLIGATORIO</Form.Text>
                    </>
                    : <Form.Text as={Row} muted style={{marginLeft: "10px"}}>OPZIONALE</Form.Text>
                }

                <Form.Control required as="textarea" placeholder="Inserisci la tua risposta..."
                    onChange={(ev) => handleChange(ev)}
                    isInvalid={!!(props.submitted && err)}
                ></Form.Control>
                <Form.Control.Feedback type="invalid">{err}</Form.Control.Feedback>
            </Form.Group>
        </Container>

    else return <Container id="domandaOpzionale">
        <Form.Group size="lg">
            <Form.Label style={{fontSize: 22, fontStyle: "italic", fontWeight: 500}} >{props.domanda.quesito}</Form.Label>
            {props.domanda.min === 1 ?
                <>
                    <Form.Label style={{ color: "red", marginLeft: "10px" }}> *</Form.Label>
                    <Form.Text as={Row} muted style={{marginLeft: "10px"}}>OBBLIGATORIO</Form.Text>
                </>
                : <Form.Text as={Row} muted style={{marginLeft: "10px"}}>OPZIONALE</Form.Text>
            }
            {props.risposta.length === 0 || props.risposta[0].risp === null ? <Form.Control readOnly type="text" placeholder={""} /> 
            : <Form.Control readOnly type="text" placeholder={ props.risposta[0].risp} />}
            
        </Form.Group>
    </Container>

}

export default DomandaAperta;