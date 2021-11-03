import { Row, Container, Form } from "react-bootstrap"
import { useState } from "react";


function DomandaChiusa(props) {

    //risposte
    const [ris, setRis] = useState([]);

    //informazione su quante checkbox sono schiacciate
    const [pushed, setPushed] = useState(0);

    const [errMax, setErrMax] = useState(pushed > props.domanda.max ? "Non soddisfa i vincoli sul numero massimo di risposte!" : "");
    const [errMin, setErrMin] = useState(pushed < props.domanda.min ? "Non soddisfa i vincoli sul numero minimo di risposte!" : "");


    //ti setta le risposte in un unica stringa; risp0_rispX_...
    const handleChange = (event) => {
        const min = props.domanda.min;
        const max = props.domanda.max;
        
        let tmpPushed = pushed;
        let stringa = "";
        for (let r of ris) {
            stringa.length === 0 ?
                stringa = r 
                : 
                stringa = stringa + "_" + r;
        }

        if (event.target.checked) {
            setRis([...ris, event.target.id]);
            setPushed(pushed => pushed + 1);
            tmpPushed = tmpPushed + 1;

            stringa.length === 0 ?
                stringa = event.target.id 
                : 
                stringa = stringa + "_" + event.target.id;
        }
        else {
            setRis(ris.filter(r => r !== event.target.id));
            setPushed(pushed => pushed - 1);
            tmpPushed = tmpPushed - 1;
            stringa = "";
            for (let r of ris.filter(r => r !== event.target.id)) {
                stringa.length === 0 ?
                    stringa = r : stringa = stringa + "_" + r;
            }
        }
        props.addRisposta(stringa, props.domanda.pos);


        if (tmpPushed < min) {
            setErrMin("Non soddisfa i vincoli sul numero minimo di risposte!");
            props.addError("Non soddisfa i vincoli sul numero minimo di risposte!", props.domanda.pos);
        }
        else {
            setErrMin("");
            if (tmpPushed <= max) {
                setErrMax("")
                props.addError("", props.domanda.pos);
            }
            else {
                setErrMin("Non soddisfa i vincoli sul numero massimo di risposte!");
                props.addError("Non soddisfa i vincoli sul numero massimo di risposte!", props.domanda.pos);
            }
        }

    }


    if (!props.readonly)
        return <Container id="domandaOpzionale">
            <Form.Group size="lg" onChange={handleChange}>
                <Form.Label style={{ fontSize: 22, fontStyle: "italic", fontWeight: 500 }}>{props.domanda.quesito}</Form.Label>
                {props.domanda.min === 0 ? <></> : <Form.Label style={{ color: "red", marginLeft: "10px" }}> *</Form.Label>}
                <Form.Text as={Row} muted style={{ marginLeft: "10px" }} >min={props.domanda.min} max={props.domanda.max}</Form.Text>
                <Container style={{ marginTop: "15px" }}>
                    {
                        props.domanda.risposte.map((risp, index) => {
                            return <Form.Check key={[index]} type="checkbox" id={[index]} label={risp}
                                isInvalid={!!(props.submitted && (errMax || errMin))}
                                isValid={!!(props.submitted && !(errMax || errMin))}
                            >
                            </Form.Check>
                        })
                    }
                </Container>
            </Form.Group>
        </Container>

    else return <Container id="domandaOpzionale">
        <Form.Group size="lg" >
            <Form.Label style={{ fontSize: 22, fontStyle: "italic", fontWeight: 500 }}>{props.domanda.quesito}:</Form.Label>
            {props.domanda.min === 0 ? <></> : <Form.Label style={{ color: "red", marginLeft: "10px" }}> *</Form.Label>}
            <Form.Text as={Row} muted style={{ marginLeft: "10px" }}>min={props.domanda.min} max={props.domanda.max}</Form.Text>
            <Container style={{ marginTop: "15px" }}>
                {

                    props.domanda.risposte.map((risp, index) => {

                        let risposteDate;

                        if (props.risposte.length === 0)
                            risposteDate = []

                        else risposteDate = [...props.risposte[0].risp]

                        if (risposteDate.includes(risp))
                            return <Form.Check readOnly checked key={[index]} type="checkbox" id={[index]} label={risp} disabled/>

                        else return <Form.Check readOnly checked={false} key={[index]} type="checkbox" id={[index]} label={risp} disabled/>
                    })

                }
            </Container>

        </Form.Group>

    </Container >


}
export default DomandaChiusa;