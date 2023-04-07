import { useDispatch } from 'react-redux';
import React, { useEffect, useMemo, useState, Fragment } from 'react'
import { useLocation } from 'react-router-dom';
import { MetaTags } from 'react-meta-tags'
import { BreadcrumbsItem } from 'react-breadcrumbs-dynamic'
import { Avatar, Box, Button, Grid, Paper, Tab, Tabs, Typography, styled } from '@mui/material';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

import LayoutOne from '../../layouts/LayoutOne';
import Breadcrumb from '../../wrappers/breadcrumb/Breadcrumb';
import callApi, { RESPONSE_TYPE } from '../../utils/callApi';
import { onShowPopupErrorBase } from '../../redux/actions/popupErrorBaseActions';
import { onCloseModalLoading, onOpenModalLoading } from '../../redux/actions/modalLoadingActions';
import { ddmmyy } from '../../utils/DateFormat';
import ShopProducts from '../../wrappers/product/ShopProducts';
import { PRODUCT_ON_SALE_KEY, PRODUCT_SOLD_KEY } from '../other/my-products/constants';
import { PRODUCT_ON_SALE_STATUS, PRODUCT_SOLD_STATUS } from '../../constants';
function a11yProps(index) {
  return {
    id: `products-tab-${index}`,
    'aria-controls': `products-tabpanel-${index}`,
  };
}
const BoxUserInfo = styled(Box)(() => ({
  marginBottom: "1rem",
  display: "flex",
  alignItems: "center",
  width: "100%"
}));
const UserInfo = ({ match }) => {
  const dispatch = useDispatch();
  const userId = match.params.id
  const { pathname } = useLocation();
  const [userInfo, setUserInfo] = useState(null);

  const avatar = useMemo(() => {
    return userInfo?.avatar?.url;
  }, [userInfo]);

  const [productStatusShow, setProductSatusShow] = React.useState(PRODUCT_ON_SALE_KEY);

  const handleChangeProductStatusShow = (event, newValue) => {
    setProductSatusShow(newValue);
  };
  const productShow = useMemo(() => {
    if (userInfo?.product && Array.isArray(userInfo.product)) {
      return userInfo.product.filter((product) => {
        const statusShow = productStatusShow === PRODUCT_ON_SALE_KEY ? PRODUCT_ON_SALE_STATUS : PRODUCT_SOLD_STATUS;
        return product?.status === statusShow
      })
    }
    return [];
  }, [userInfo, productStatusShow]);
  useEffect(() => {
    const getUserInfo = async () => {
      dispatch(onOpenModalLoading())
      const response = await callApi({
        url: process.env.REACT_APP_API_ENDPOINT + "/users/" + userId,
        method: "get",
        params: {
          populate: {
            product: {
              populate: {
                images: {
                  populate: "*"
                },
                userId: {
                  populate: {
                    avatar: {
                      populate: "*"
                    },
                    product: {
                      populate: "*"
                    }
                  }
                }
              },
            },
            avatar: {
              populate: "*"
            }
          }
        }
      })
      if (response.type === RESPONSE_TYPE) {
        const responseData = response.data;
        setUserInfo(responseData);
      } else {
        dispatch(onShowPopupErrorBase(response))
      }
      dispatch(onCloseModalLoading())
    }
    getUserInfo();
  }, [userId, dispatch]);

  return (
    <Fragment>
      <MetaTags>
        <title>Student Market | Thông tin người bán</title>
        <meta
          name="description"
          content="Compare page of flone react minimalist eCommerce template."
        />
      </MetaTags>
      <BreadcrumbsItem to={process.env.PUBLIC_URL + "/"}>Trang chủ</BreadcrumbsItem>
      <BreadcrumbsItem to={process.env.PUBLIC_URL + pathname}>
        Thông tin người bán
      </BreadcrumbsItem>
      <LayoutOne headerTop="visible">
        <Breadcrumb />
        <div className="product-area pt-60 pb-60">
          <div className="container">
            <div className="row">
              <Paper sx={{ padding: "1rem", width: "100%" }}>
                <Grid container>
                  <Grid item xs={6}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                    <Avatar
                      src={`${process.env.REACT_APP_SERVER_ENDPOINT}${avatar}`}
                      sx={{ width: "100px", height: "100px", border: "1px solid #ccc" }}>
                    </Avatar>
                    <Box marginLeft={"1rem"}>
                      <Typography fontWeight={"bold"} marginBottom={"1rem"}>{userInfo?.fullName}</Typography>
                      <Button sx={{ textTransform: "capitalize" }} variant='contained' startIcon={<AddIcon />}>Theo dõi</Button>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <BoxUserInfo >
                      <CalendarMonthIcon />
                      <Typography fontWeight={"bold"} marginLeft="1rem">{"Ngày tham gia"}</Typography>
                      <Typography marginLeft="1rem">{ddmmyy(new Date(userInfo?.createdAt))}</Typography>
                    </BoxUserInfo>
                    <BoxUserInfo >
                      <SchoolIcon />
                      <Typography fontWeight={"bold"} marginLeft="1rem">{"Trường đại học"}</Typography>
                      <Typography marginLeft="1rem">{userInfo?.university}</Typography>
                    </BoxUserInfo>
                    <BoxUserInfo >
                      <LocationOnIcon />
                      <Typography fontWeight={"bold"} marginLeft="1rem">{"Địa chỉ nhà"}</Typography>
                      <Typography marginLeft="1rem">{userInfo?.address}</Typography>
                    </BoxUserInfo>
                    <BoxUserInfo >
                      <PhoneIcon />
                      <Typography fontWeight={"bold"} marginLeft="1rem">{"Số điện thoại"}</Typography>
                      <Typography marginLeft="1rem">{userInfo?.phone}</Typography>
                    </BoxUserInfo>
                  </Grid>
                </Grid>
              </Paper>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', margin: "2rem 0" }}>
                    <Tabs value={productStatusShow} onChange={handleChangeProductStatusShow} aria-label="basic tabs example">
                      <Tab label="Sản phẩm đang bán" {...a11yProps(PRODUCT_ON_SALE_KEY)} />
                      <Tab label="Sản phẩm đã bán" {...a11yProps(PRODUCT_SOLD_KEY)} />
                    </Tabs>
                  </Box>
                </Box>
                <ShopProducts layout={'grid three-column'} products={productShow} />
              </Box>
            </div>
          </div>
        </div>
      </LayoutOne>
    </Fragment >
  )
}

export default UserInfo