import {Alert, Button, Form, Row, Col, Stack} from "react-bootstrap";


const Register = () => {
    return ( 
    <>
    <Form>
        <Row style={{
            height: "120vh",
            justifyContent: "center",
            paddingTop: "8%",
        }}>
            <Col xs={6}>
            <Stack gap={3}>
            <h2>Register</h2>
            <Form.Control type="text" placeholder="Name"/>
            <Form.Control type="email" placeholder="@email"/>
            <Form.Control type="password" placeholder="Password"/>
            <Button variant="primary" type="submit">
                Register
            </Button>

            <Alert variant="danger"><p>Something went wrong (T_T)</p></Alert>
            </Stack>
            </Col>
        </Row>
    </Form>
    </> );
}
 
export default Register;