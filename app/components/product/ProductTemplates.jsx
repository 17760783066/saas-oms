import React, { Component } from 'react';
import { FileAddOutlined, DownOutlined, ExclamationCircleOutlined } from '_@ant-design_icons@4.7.0@@ant-design/icons';
import { Card, Button, Form, Row, Col, Select, Table, Input, TreeSelect, Dropdown, Menu, Modal } from 'antd';
import { App, CTYPE, U, Utils } from '../../common';
import BreadcrumbCustom from '../BreadcrumbCustom';
import ProductUtils from './ProductUtils';
const FormItem = Form.Item;
const { Search } = Input;

class ProductTemplates extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pagination: {
                pageSize: CTYPE.pagination.pageSize,
                current: 0,
                total: 0,
                selectedRowKeys: [],
                loading: false,
            },
            productQo: {},
            list: [],
            categories: [],

        }
    }
    componentDidMount() {
        this.loadData();
        App.api('adm/product/categories').then((categories) => {
            this.setState({
                categories
            })
        });
    }

    loadData = () => {
        let { pagination, productQo = {} } = this.state;
        this.setState({ loading: true });
        App.api('adm/product/templates', {
            productQo: JSON.stringify({
                ...productQo,
                pageNumber: pagination.current,
                pageSize: pagination.pageSize
            })
        }).then((ret) => {
            let pagination = Utils.pager.convert2Pagination(ret);
            let { content = [] } = ret;
            this.setState({
                list: content,
                pagination,
                loading: false
            });
        });

    };
    start = () => {
        let { selectedRowKeys = [] } = this.state;
        this.setState({
            selectedRowKeys: [],
        });
        var ids = selectedRowKeys;
        App.api('adm/product/remove_template', {
            ids: JSON.stringify(ids)
        }).then(() => {
            this.loadData();
        })

    };

    edit = productTemplate => {

        App.go(`/app/product/product-edit/${productTemplate.id}`)
    }
    status = (id, status) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            title: `??????${status == 1 ? '??????' : '??????'}??????`,
            onOk: () => {
                App.api(`adm/product/status_product_template`, { id, status: status == 1 ? 2 : 1 }).then(() => { this.loadData() })
            },
            onCancel() {
            },
        })
    }
    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };
    reloadDate = (key, value) => {
        let { pagination = {}, productQo = {} } = this.state;
        if (key) {
            productQo[key] = value;
        }
        this.setState(
            {
                productQo,
                pagination: {
                    ...pagination,
                    current: 1,
                },
            },
            () => {
                this.loadData();
            }
        );
    };


    confirm = () => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            title: '????????????????????????',
            onOk: () => { this.start() },
            onCancel() {
            },
        })
    }
    render() {
        let { loading, selectedRowKeys = [], list = [], categories = [] } = this.state;

        console.log(selectedRowKeys);

        const hasSelected = selectedRowKeys.length > 0;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        return (
            <div>
                <BreadcrumbCustom first={CTYPE.link.products_templates.txt} />
                <Card>
                    <Row style={{ marginBottom: 10 }}>
                        <Col span={10}>
                            <Button type="primary" icon={<FileAddOutlined />} onClick={() => {
                                this.edit({ id: 0 })
                            }}>????????????</Button>
                            <Button type="danger" onClick={this.confirm} disabled={!hasSelected} loading={loading}>
                                {(selectedRowKeys.length == 0) ? `????????????` : `?????? ${selectedRowKeys.length} ???`}
                            </Button>

                        </Col>
                        <Col span={14}>
                            <Select
                                defaultValue='??????'
                                style={{ float: 'right' }}
                                onChange={(value) =>
                                    this.reloadDate('status', value)}>
                                <Option value="0">??????</Option>
                                <Option value="1">??????</Option>
                                <Option value="2">??????</Option>
                            </Select>
                            <Search
                                style={{ width: '300px', float: 'right', marginRight: '10px' }}
                                placeholder="??????????????????"
                                onSearch={(val) => {
                                    this.reloadDate('name', val);
                                }
                                }
                            />
                            <TreeSelect
                                treeData={categories}
                                showSearch
                                style={{ width: '50%' }}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                treeNodeFilterProp="label"
                                placeholder="???????????????"
                                allowClear
                                treeDefaultExpandAll
                                treeCheckable
                                multiple
                                fieldNames={{ label: 'name', key: 'sequence', value: 'id' }}
                                onChange={(value) => {
                                    this.reloadDate('mixtureCategoryIds', value);
                                }}
                            />

                        </Col>
                    </Row>
                    {/* <Table rowSelection={rowSelection} columns={productQo} dataSource={productQo} /> */}
                    <Table
                        rowSelection={rowSelection}
                        columns={[{
                            title: '??????',
                            dataIndex: 'id',
                            align: 'center',
                            width: '80px',
                            render: (col, row, i) => i + 1
                        }, {
                            title: '??????',
                            dataIndex: 'name',
                            align: 'center',

                        }, {
                            title: '??????',
                            dataIndex: 'categoryId',
                            align: 'center',
                            render: (categoryId) => ProductUtils.renderCateTags(categoryId, categories)
                        }, {
                            title: '??????',
                            dataIndex: 'specs',
                            align: 'center',
                            render: (specs = []) => {
                                let imgs = specs.length > 0 ? specs[0].imgs : [];
                                return <img style={{ width: 60, height: 60 }} src={imgs[0]}
                                    onClick={() => {
                                        Utils.common.showImgLightbox(imgs)
                                    }} />
                            }

                        }, {
                            title: '??????',
                            dataIndex: 'specs',
                            align: 'center',
                            render: (specs = [], productTemplate) => {
                                return <a onClick={() => { ProductUtils.drawer(productTemplate.id) }}>???{specs.length}???</a>
                            }
                        }, {
                            title: '??????',
                            dataIndex: 'params',
                            align: 'center',
                            render: (params = [], productTemplate) => {
                                return <a onClick={() => { ProductUtils.drawer(productTemplate.id) }}>???{params.length}???</a>
                            }
                        }, {

                            title: '????????????',
                            dataIndex: 'createdAt',
                            align: 'center',
                            width: '160px',
                            render: (t) => t ? U.date.format(new Date(t), 'yyyy-MM-dd HH:mm') : '-/-'
                        },
                        {
                            title: '??????',
                            dataIndex: 'status',
                            align: 'center',
                            render: (status) => Utils.getStatus(status).tag
                        }, {
                            title: '??????',
                            dataIndex: 'option',
                            align: 'center',
                            width: '100px',
                            render: (obj, productTemplate, index) => {
                                let { status, id, } = productTemplate;
                                return <Dropdown overlay={<Menu>
                                    <Menu.Item key="1">
                                        <a onClick={() => this.edit(productTemplate)}>??????</a>
                                    </Menu.Item>
                                    <Menu.Divider />
                                    <Menu.Item key="2">
                                        <a onClick={() => this.status(id, status)}>{status == 1 ? '??????' : '??????'}</a>
                                    </Menu.Item>
                                </Menu>} trigger={['click']}>
                                    <a className="ant-dropdown-link">
                                        ?????? <DownOutlined />
                                    </a>
                                </Dropdown>
                            }

                        }]}
                        rowKey={(item) => item.id}
                        dataSource={list}
                        pagination={false}
                        loading={loading}
                    />
                </Card>

            </div>
        );
    }
}

export default ProductTemplates;