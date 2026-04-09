import qs from "qs";
import $axios from "axios";

const name = "[/assets/backend/base.js]";

const $base = {

  ////////////////////////////////////
  // api Utils..
  ////////////////////////////////////
  api: {

    // 요청 전송
    execute(options) {

      // 쿼리 파라미터를 직렬화하여 반복 전송
      options["paramsSerializer"] = (p) => {
        // arrayFormat : 배열 파라미터를 URL에 표현할 방식
        return qs.stringify(p, { arrayFormat: "repeat" });
      },

        // 요청 시작 시간을 timestamp로 기록
        options["timestamp"] = new Date().getTime();
      if (options.data) console.log(options.timestamp, options.url, options.data);
      else console.log(options.timestamp, options.url);

      // 실제 axios 요청 실행
      return $axios(options);
    },


    // 응답 성공 처리
    then(r) {
      if (r && r.config) {
        let options = r.config;
        let headers = r.headers;
        if (headers["content-type"].includes("json")) {
          console.log(options.timestamp, options.url, r.status);
        } else {
          // JSON이 아닐 경우
          console.log(options.timestamp, options.url, "Not JSON");
          // 404 에러를 던짐
          throw 404;
        }
      }
      return r.data;
    },

    // 에러 처리
    catch(e) {

      // 서버가 응답은 했지만 에러
      if (e && e.response && e.response.config) {
        let options = e.response.config;
        console.log(options.timestamp, options.url, e.response.status, options);
        throw e.response.status;
      }

      // 서버에 응답이 없는 경우
      if (e && e.config) {
        let options = e.config;
        console.log(options.timestamp, options.url, "Network Error");
        throw 404;
      }
      throw e;
    },

    headers(headers, token) {

      // 토큰이 없는 경우
      if (token == undefined) {
        return (headers == undefined) ? {} : headers;
      }

      // 토큰이 있는데 헤더가 없는 경우
      if (headers == undefined) {
        return { Authorization: `Bearer ${token}` };
      } else {
        // 둘다 있는 경우
        headers["Authorization"] = `Bearer ${token}`;
        return headers;
      }
    },

    params(params, token) {

      // 토큰이 없는 경우
      if (token == undefined) {
        return (params == undefined) ? {} : params;
      }

      // 토큰이 있는데 헤더가 없는 경우
      if (params == undefined) {
        return { access_token: `${token}` };
      } else {
        // 둘다 있는 경우
        params["access_token"] = `${token}`;
        return params;
      }
    },

    // 쿼리 파라미터로 URL 문자열로 만들기
    query(query, token) {
      let params = (query == undefined || query instanceof object) ? query : qs.parse(query);
      params = $base.api.params(params, token);
      return qs.stringify(params, { arrayFormat: "repeat" });
    },


    // 서버에 요청할 페이지 객체 만들기
    pageable(data) {

      // 데이터가 없으면 빈 객체 반환
      if (!data) return {};
      const sort = [];
      if (data.sortBy != undefined) {
        data.sortBy.forEach((s, i) => {
          sort.push(s.key + "," + s.order);
        });
      }
      let pageRequest = {
        size: data.itemsPerPage,
        page: data.page - 1,
        sort: sort,
      };
      return pageRequest;
    },
  },



  ////////////////////////////////////
  // Meta Utils..
  ////////////////////////////////////
  meta: {

    env() {

      return $axios({
        method: 'GET',
        url: "/config.json",
      })
        .then((r) => {
          // config.json에 값이 있으면 해당 값을 사용, 없으면 환경 변수 값 사용
          console.log("config.json");
          let result = {};
          for (let i = 0; i < arguments.length; i++) {
            let k = `${arguments[i]}`;
            let v = r.data[k];
            if (v == undefined) {
              v = import.meta.env[k];
            }
            result[k] = v;
          }
          return result;
        })
        // config.json 자체를 못 가져왔을 경우 전체를 환경변수로 대쳋
        .catch((e) => {
          let result = {};
          for (let i = 0; i < arguments.length; i++) {
            let k = `${arguments[i]}`;
            let v = import.meta.env[k];
            result[k] = v;
          }
          return result;
        });
    },


    // JWT 토큰에서 사용자 정보 꺼내기
    jwt(token) {

      // .기준으로 토큰 나누기
      let base64Payload = token.split('.')[1];

      // JWT에서 가져온 문자열을 디코딩 가능한 형태(Base64)로 바꾸는 코드
      let base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');

      // JWT Payload 값을 디코딩해서 JSON 객체로 만드는 코드
      let decodedJWT = JSON.parse(
        decodeURIComponent(
          window
            .atob(base64)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        )
      );
      return decodedJWT;
    },

    // pathnames : 붙일 경로
    // protocols : 사용할 프로토콜
    href(pathnames, protocols) {

      // 경로 없으면 그냥 종료
      if (pathnames == undefined) return undefined;

      console.log(window.location);

      // 현재 주소 정보 가져오기
      let hostname = window.location.hostname;
      let port = window.location.port;
      let host = window.location.host;
      let protocol = window.location.protocol;

      let origin = window.location.origin;
      let pathname = window.location.pathname;
      let href = window.location.href;

      // protocol: "https:"
      // hostname: "192.168.75.107"
      // port: "3000"
      // host: "192.168.75.107:3000"
      // origin: "https://192.168.75.107:3000"
      // pathname: "/contents/83151238-fda2-4feb-93bc-a11b94a38f1d/11"
      // href: "https://192.168.75.107:3000/contents/83151238-fda2-4feb-93bc-a11b94a38f1d/11"


      // 프로토콜 없을 때
      if (protocols == undefined) {
        return `${origin}${pathnames}`;
      } else {
        // 프로토콜 있을 때
        return `${protocols}://${host}${pathnames}`;
      }
    }
  }
}
export default $base;