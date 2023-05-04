import { Avatar, Box, Button, Typography, Dialog, DialogTitle, DialogActions } from '@mui/material'
import palette from '../../assets/palette'
import React from 'react'
import { Link } from 'react-router-dom'
import { ddmmyy } from '../../utils/DateFormat'
import { useEffect } from 'react'
import { useState } from 'react'

import { getUserLogin } from "../../utils/userLoginStorage";
import { useToasts } from "react-toast-notifications";
import callApi, { RESPONSE_TYPE } from '../../utils/callApi';
import { useDispatch } from 'react-redux';
import { onShowPopup } from '../../redux/actions/popupActions';
import { POPUP_TYPE_ERROR } from '../../redux/reducers/popupReducer';
import { onClosePopup } from '../../redux/actions/popupActions';

const ProductOwnerInfo = ({ user, onHideModal, check, listFollow, changeList }) => {
  const userAttributes = user?.attributes
  const account = getUserLogin()?.user;
  const { addToast } = useToasts();
  const dispatch = useDispatch();

  const [listIdFollow, setListIdFollow] = useState([])
  const [isFollow, setIsFollow] = useState(false)
  const [openUnFollow, setOpenUnFollow] = useState(false)
  
  useEffect(()=>{
    if(check === 1){
      let list = userAttributes?.followers?.data
      list.map((follower) =>{
        setListIdFollow(listIdFollow.concat(follower.id))
        if(account?.id === follower.id)
          setIsFollow(true)
      })
    }
    else if(check === 2){
      setListIdFollow(listFollow)
      setIsFollow(true)
    }
  }, [userAttributes])
  
  const handleCloseUnFollow = () => {
    setOpenUnFollow(false);
  }

  const handleUnFollow = async () => {
    let count = 0;
    if(check === 1){
      let list = listIdFollow.filter((item)=> item !== account.id);
      setListIdFollow(list);
      const response = await callApi({
        url: process.env.REACT_APP_API_ENDPOINT + "/users/" + user?.id,
        method: "put",
        data: {
          "user_followed": list,
        },
      })
      if (response.type === RESPONSE_TYPE) {
        count++;  
        setIsFollow(false);
        setOpenUnFollow(false);
      }
    }
    else if(check === 2){
      let list = listFollow.filter((item)=> item !== user?.id);
      setListIdFollow(list);
      const response = await callApi({
        url: process.env.REACT_APP_API_ENDPOINT + "/users/" + account.id,
        method: "put",
        data: {
          "user_followed": list,
        },
      })
      if (response.type === RESPONSE_TYPE) {
        count++;  
        setIsFollow(false);
        setOpenUnFollow(false);
        changeList(true);
      }
    }
    
    if (count > 0) {
      addToast("Hủy theo dõi thành công", {
        appearance: "success",
        autoDismiss: true
      });
    }
    
  }

  const handleFollow = async () => {
    if(isFollow){
      setOpenUnFollow(true)
    }
    else{
      if(account){
        let list = listIdFollow.concat(account.id);
        setListIdFollow(listIdFollow.concat(account.id));
        const response = await callApi({
          url: process.env.REACT_APP_API_ENDPOINT + "/users/" + user?.id ,
          method: "put",
          data: {
            "followers": list,
          },
        })
        if (response.type === RESPONSE_TYPE) {
          addToast("Theo dõi thành công", {
            appearance: "success",
            autoDismiss: true
          });
          setIsFollow(true);
        }
      }
      else{
        dispatch(onShowPopup({
          type: POPUP_TYPE_ERROR,
          title: "Đăng nhập",
          content: "Hãy quay lại đăng nhập để bình luận",
          showButtonCancel: false,
          closeAction: () => dispatch(onClosePopup()),
          clickOkeAction: () => dispatch(onClosePopup()),
        }))
      }
    }
  }

  return (
    <Box
      className="product-onwer-info"
      display={"flex"}
    >
      <Avatar
        sx={{ width: 100, height: 100 }}
        variant="rounded"
        alt={userAttributes?.name}
        src={process.env.REACT_APP_SERVER_ENDPOINT + (userAttributes?.avatar?.data?.attributes?.url || user?.avatar?.url)}
      />
      <Box
        ml="1rem"
        display={"flex"}
        flexDirection="column"
        justifyContent={"space-between"}
      >
        <Link
          onClick={onHideModal}
          to={`/user/info/${user?.id}`}
          style={{
            color: palette.primary.main,
            fontWeight: "bold"
          }}
        >
          {userAttributes?.fullName || user?.fullName}
        </Link>
        <Box display={"flex"}>
          <p>Ngày tham gia :</p>
          <Typography
            component="span"
            fontWeight="bold"
            marginLeft={"0.4rem"}
          >{ddmmyy(new Date(userAttributes?.createdAt || user?.createdAt))}</Typography>
        </Box>
        <Box display={"flex"}>
          <p>Sản phẩm :</p>
          <Typography component="span"
            fontWeight="bold"
            marginLeft={"0.4rem"}>{userAttributes?.product?.data?.length || user?.product?.length || 0}</Typography>
        </Box>

        <Box display={"flex"}>
          <p>Vị trí :</p>
          <Typography component="span"
            fontWeight="bold"
            marginLeft={"0.4rem"}>{userAttributes?.university || user?.university || ""}</Typography>
        </Box>
      </Box>
      <Box
        ml={"1rem"}
        display={"flex"}
        alignItems="center"
      >
        {
          isFollow ? 
          <Button sx={{ textTransform: "capitalize" }} variant='outlined' onClick={handleFollow}>Đang theo dõi</Button> : 
          <Button sx={{ textTransform: "capitalize" }} variant="contained" onClick={handleFollow}>Theo dõi</Button>
        }
      </Box>
      <Dialog open={openUnFollow} onClose={handleCloseUnFollow}>
          <DialogTitle>{'Bạn có muốn hủy theo dõi người dùng này không?'}</DialogTitle>
          <DialogActions sx={{ justifyContent: 'center' }}>
              <Button onClick={handleCloseUnFollow} variant="contained" color="error">
                không
              </Button>
              <Button onClick={handleUnFollow} variant="contained">
                có
              </Button>
          </DialogActions>
        </Dialog>
    </Box>
  )
}

export default ProductOwnerInfo