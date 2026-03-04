import 'styled-components';
import { Theme } from './theme';

/**
 * Styled Components Theme Type Declaration
 * styled-components의 DefaultTheme을 확장하여 타입 안정성 확보
 */
declare module 'styled-components' {
  // styled-components 모듈 증강 패턴: 빈 인터페이스가 Theme 타입을 DefaultTheme에 병합한다.
  // interface 선언 병합(Declaration Merging)이 필요하므로 type alias로 대체 불가.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends Theme {}
}
