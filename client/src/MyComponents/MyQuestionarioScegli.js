
import { Table, Button, Container, Spinner } from "react-bootstrap"
import { AiOutlineSelect } from "react-icons/ai"
import { Link } from 'react-router-dom';


function MyQuestionari(props) {

    return <Container>
        <h1 style={{ marginTop: 15, textAlign: "center" }}>Seleziona un Questionario </h1>
        {
            props.loading ?
                <Container id="containerSpinner">
                    <Spinner animation="border" variant="danger" />
                </Container>
                :
                <Table striped hover>

                    <thead>
                        <tr>
                            <th>Titolo</th>
                            <th>Creatore</th>
                            <th>Compila</th>
                        </tr>

                    </thead>

                    <tbody>
                        {
                            props.questionari.map((quest) =>
                                <HeaderQuest key={quest.idQuest} idQuest={quest.idQuest} titolo={quest.titolo}
                                    nome={quest.nome}
                                ></HeaderQuest>
                            )
                        }
                    </tbody>


                </Table>
        }

    </Container>


}

function HeaderQuest(props) {

    return <tr>
        <th>{props.titolo}</th>
        <th>{props.nome}</th>
        <th>
            <Link to={{
                pathname: "/questionari/" + props.idQuest
            }}>
                <Button id="buttonCompilatore" >
                    <AiOutlineSelect></AiOutlineSelect>
                </Button>
            </Link>
        </th>
    </tr>

}


export default MyQuestionari;