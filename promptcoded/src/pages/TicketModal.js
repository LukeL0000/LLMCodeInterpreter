import React, { useState } from 'react';
import { Button, Modal, Form, Input } from 'antd';
import { FlagFilled } from '@ant-design/icons';

// Form component for creating a ticket
const CreateForm = ({ visible, setVisible, onCreate }) => {
    const [form] = Form.useForm();

    const handleCreate = () => {
        form
            .validateFields()
            .then((values) => {
                form.resetFields();
                setVisible(false);
                onCreate(values);
            })
            .catch((info) => {
                //console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            open={visible}
            title="Submit a ticket to Instructor"
            okText="Submit"
            onCancel={() => {
                setVisible(false);
            }}
            onOk={handleCreate}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="description"
                    label="Description"
                    rules={[
                        { required: true, message: 'Please input issue with the LLM code!' }
                    ]}
                >
                    <Input.TextArea />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// Main TicketModal component
const TicketModal = ({ currentUser, codeSample, attemptID, setTicketSent }) => {
    const [visible, setVisible] = useState(false);

    // Function to handle ticket submission
    const handleTicket = async (values) => {
        const data = {
            username: currentUser,
            code_sample_id: codeSample.code_sample_id,
            ticketDescription: values.description,
            attempt_id: attemptID
        };

        try {
            const response = await fetch(`http://localhost:9000/attempts/${encodeURIComponent(currentUser)}/${encodeURIComponent(data.code_sample_id)}/ticket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            //console.log(result);
            if (result.success) {
                setTicketSent(true);
            }
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    // Callback function to pass to CreateForm
    const onCreate = (values) => {
        handleTicket(values);
    };

    return (
        <div>
            <Button
                type="ghost"
                onClick={() => {
                    setVisible(true);
                }}
            >
                <FlagFilled />
                Create a ticket
            </Button>
            <CreateForm
                visible={visible}
                setVisible={setVisible}
                onCreate={onCreate}
            />
        </div>
    );
};

export default TicketModal;
